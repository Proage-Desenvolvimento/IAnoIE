import json
from typing import Optional

import httpx
import structlog
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ianoie.core.crypto import decrypt_api_key, encrypt_api_key
from ianoie.core.exceptions import LLMProviderNotFound
from ianoie.models.llm_provider import LLMProvider, LLMProviderType
from ianoie.schemas.llm_provider import (
    LLMProviderCreate,
    LLMProviderResponse,
    LLMProviderTestResult,
    LLMProviderUpdate,
)

logger = structlog.get_logger()

# Well-known models for providers that don't have a list endpoint
ANTHROPIC_MODELS = [
    "claude-sonnet-4-20250514",
    "claude-opus-4-20250514",
    "claude-haiku-4-20250514",
    "claude-3-5-sonnet-20241022",
    "claude-3-5-haiku-20241022",
    "claude-3-opus-20240229",
]


class LLMProviderService:
    def __init__(self, db: AsyncSession):
        self.db = db

    async def list_providers(self) -> list[LLMProviderResponse]:
        result = await self.db.execute(
            select(LLMProvider).order_by(LLMProvider.name)
        )
        providers = result.scalars().all()
        return [self._to_response(p) for p in providers]

    async def get_provider(self, provider_id: int) -> LLMProviderResponse:
        provider = await self._get_by_id(provider_id)
        return self._to_response(provider)

    async def create_provider(self, data: LLMProviderCreate) -> LLMProviderResponse:
        # If setting as default, unset other defaults
        if data.is_default:
            await self._clear_defaults()

        encrypted_key = encrypt_api_key(data.api_key) if data.api_key else None

        provider = LLMProvider(
            name=data.name,
            provider_type=data.provider_type,
            api_key_encrypted=encrypted_key,
            base_url=data.base_url,
            is_default=data.is_default,
            enabled=True,
        )
        self.db.add(provider)
        await self.db.commit()
        await self.db.refresh(provider)

        return self._to_response(provider)

    async def update_provider(
        self, provider_id: int, data: LLMProviderUpdate
    ) -> LLMProviderResponse:
        provider = await self._get_by_id(provider_id)

        if data.name is not None:
            provider.name = data.name
        if data.api_key is not None:
            provider.api_key_encrypted = encrypt_api_key(data.api_key)
        if data.base_url is not None:
            provider.base_url = data.base_url
        if data.models is not None:
            provider.models = json.dumps(data.models)
        if data.is_default is not None:
            if data.is_default:
                await self._clear_defaults()
            provider.is_default = data.is_default
        if data.enabled is not None:
            provider.enabled = data.enabled

        await self.db.commit()
        await self.db.refresh(provider)

        return self._to_response(provider)

    async def delete_provider(self, provider_id: int) -> None:
        provider = await self._get_by_id(provider_id)
        await self.db.delete(provider)
        await self.db.commit()

    async def toggle_provider(self, provider_id: int) -> LLMProviderResponse:
        provider = await self._get_by_id(provider_id)
        provider.enabled = not provider.enabled
        await self.db.commit()
        await self.db.refresh(provider)
        return self._to_response(provider)

    async def test_connection(self, provider_id: int) -> LLMProviderTestResult:
        provider = await self._get_by_id(provider_id)
        api_key = decrypt_api_key(provider.api_key_encrypted) if provider.api_key_encrypted else None

        try:
            if provider.provider_type == LLMProviderType.openai:
                return await self._test_openai(api_key)
            elif provider.provider_type == LLMProviderType.gemini:
                return await self._test_gemini(api_key)
            elif provider.provider_type == LLMProviderType.anthropic:
                return await self._test_anthropic(api_key)
            elif provider.provider_type == LLMProviderType.ollama:
                return await self._test_ollama(provider.base_url)
            else:
                return LLMProviderTestResult(success=False, message="Unknown provider type")
        except Exception as e:
            logger.error("llm_test_failed", provider=provider.name, error=str(e))
            return LLMProviderTestResult(success=False, message=str(e))

    def get_decrypted_api_key_sync(self, provider_id: int) -> Optional[str]:
        """Sync version for use in Celery tasks."""
        from ianoie.database import sync_session_factory

        db = sync_session_factory()
        try:
            provider = db.get(LLMProvider, provider_id)
            if not provider or not provider.api_key_encrypted:
                return None
            return decrypt_api_key(provider.api_key_encrypted)
        finally:
            db.close()

    async def get_provider_for_install(self, provider_id: int) -> Optional[dict]:
        """Get decrypted provider config for container injection (async, for API layer)."""
        provider = await self._get_by_id(provider_id)
        api_key = decrypt_api_key(provider.api_key_encrypted) if provider.api_key_encrypted else None

        return {
            "provider_type": provider.provider_type.value,
            "api_key": api_key or "",
            "base_url": provider.base_url or "",
            "models": json.loads(provider.models) if provider.models else [],
        }

    # --- Private helpers ---

    async def _get_by_id(self, provider_id: int) -> LLMProvider:
        result = await self.db.execute(
            select(LLMProvider).where(LLMProvider.id == provider_id)
        )
        provider = result.scalar_one_or_none()
        if not provider:
            raise LLMProviderNotFound(provider_id)
        return provider

    async def _clear_defaults(self) -> None:
        result = await self.db.execute(
            select(LLMProvider).where(LLMProvider.is_default == True)  # noqa: E712
        )
        for p in result.scalars().all():
            p.is_default = False

    def _to_response(self, provider: LLMProvider) -> LLMProviderResponse:
        return LLMProviderResponse(
            id=provider.id,
            name=provider.name,
            provider_type=provider.provider_type.value,
            base_url=provider.base_url,
            models=json.loads(provider.models) if provider.models else [],
            is_default=provider.is_default,
            enabled=provider.enabled,
            has_api_key=provider.api_key_encrypted is not None,
            created_at=provider.created_at,
        )

    # --- Connection test methods ---

    async def _test_openai(self, api_key: str | None) -> LLMProviderTestResult:
        if not api_key:
            return LLMProviderTestResult(success=False, message="API key is required")
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                "https://api.openai.com/v1/models",
                headers={"Authorization": f"Bearer {api_key}"},
            )
            if resp.status_code == 200:
                data = resp.json()
                models = [m["id"] for m in data.get("data", [])]
                # Sort: gpt-4o first, then alphabetical
                models.sort(key=lambda m: (0 if "gpt-4o" in m else 1, m))
                return LLMProviderTestResult(
                    success=True, message=f"Connected — {len(models)} models available", models=models,
                )
            return LLMProviderTestResult(
                success=False, message=f"API returned {resp.status_code}: {resp.text[:200]}",
            )

    async def _test_gemini(self, api_key: str | None) -> LLMProviderTestResult:
        if not api_key:
            return LLMProviderTestResult(success=False, message="API key is required")
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.get(
                f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}",
            )
            if resp.status_code == 200:
                data = resp.json()
                models = [m["name"].replace("models/", "") for m in data.get("models", [])]
                models.sort()
                return LLMProviderTestResult(
                    success=True, message=f"Connected — {len(models)} models available", models=models,
                )
            return LLMProviderTestResult(
                success=False, message=f"API returned {resp.status_code}: {resp.text[:200]}",
            )

    async def _test_anthropic(self, api_key: str | None) -> LLMProviderTestResult:
        if not api_key:
            return LLMProviderTestResult(success=False, message="API key is required")
        # Anthropic doesn't have a public list models endpoint.
        # Validate by making a minimal messages call.
        async with httpx.AsyncClient(timeout=15) as client:
            resp = await client.post(
                "https://api.anthropic.com/v1/messages",
                headers={
                    "x-api-key": api_key,
                    "anthropic-version": "2023-06-01",
                    "content-type": "application/json",
                },
                json={
                    "model": "claude-sonnet-4-20250514",
                    "max_tokens": 1,
                    "messages": [{"role": "user", "content": "hi"}],
                },
            )
            if resp.status_code in (200, 400):
                # 200 = works, 400 = might be model name but key is valid
                return LLMProviderTestResult(
                    success=True,
                    message="Connected — API key is valid",
                    models=ANTHROPIC_MODELS,
                )
            return LLMProviderTestResult(
                success=False, message=f"API returned {resp.status_code}: {resp.text[:200]}",
            )

    async def _test_ollama(self, base_url: str | None) -> LLMProviderTestResult:
        url = base_url or "http://localhost:11434"
        async with httpx.AsyncClient(timeout=10) as client:
            try:
                resp = await client.get(f"{url.rstrip('/')}/api/tags")
                if resp.status_code == 200:
                    data = resp.json()
                    models = [m.get("name", "") for m in data.get("models", [])]
                    return LLMProviderTestResult(
                        success=True,
                        message=f"Connected — {len(models)} models available",
                        models=models,
                    )
                return LLMProviderTestResult(
                    success=False, message=f"Ollama returned {resp.status_code}",
                )
            except httpx.ConnectError:
                return LLMProviderTestResult(
                    success=False,
                    message=f"Cannot connect to Ollama at {url}. Is it running?",
                )

from collections.abc import AsyncGenerator
from contextlib import asynccontextmanager

from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from ianoie.api.router import api_router
from ianoie.config import settings
from ianoie.core.middleware import SecurityHeadersMiddleware


async def _sync_provider_enum() -> None:
    """Garante que todo valor de LLMProviderType exista no enum nativo do Postgres.

    O ``create_all`` cria o enum uma única vez e nunca faz ``ALTER``, então
    valores adicionados ao enum Python depois da criação do DB ficam ausentes no
    Postgres — inserts falham com ``DataError`` -> HTTP 500 (foi o bug do
    OpenRouter). Roda em ``AUTOCOMMIT`` porque ``ALTER TYPE ... ADD VALUE`` não
    executa dentro de transação gerenciada em versões antigas do Postgres.
    """
    from ianoie.database import async_engine
    from ianoie.models.llm_provider import LLMProviderType

    async with async_engine.connect() as conn:
        await conn.execution_options(isolation_level="AUTOCOMMIT")
        for member in LLMProviderType:
            value = member.value
            if not value.replace("_", "").isalnum():  # defensivo: só literais simples
                continue
            await conn.execute(
                text(f"ALTER TYPE llm_provider_type ADD VALUE IF NOT EXISTS '{value}'")
            )


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    from ianoie.database import async_engine
    from ianoie.models.base import Base

    async with async_engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)

    await _sync_provider_enum()

    from ianoie.seed.seed_apps import sync_apps
    await sync_apps()

    yield

    await async_engine.dispose()


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"] if settings.debug else [],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
app.add_middleware(SecurityHeadersMiddleware)

app.include_router(api_router, prefix="/api/v1")


@app.get("/health")
async def health() -> dict[str, str]:
    # Validate the DB connection so the Docker healthcheck detects both a
    # wedged event loop (no response) and an unreachable Postgres (503).
    from ianoie.database import async_session_factory

    try:
        async with async_session_factory() as session:
            await session.execute(text("SELECT 1"))
    except Exception:
        raise HTTPException(status_code=503, detail="database unavailable")
    return {"status": "ok"}

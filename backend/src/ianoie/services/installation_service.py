import json
from typing import Optional

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ianoie.core.exceptions import AppNotFound, InstallationConflict, InstallationNotFound
from ianoie.models.app import App
from ianoie.models.installation import Installation, InstallationStatus
from ianoie.models.job import Job, JobStatus, JobType
from ianoie.models.user import User
from ianoie.schemas.common import PaginatedResponse
from ianoie.schemas.installation import AccessCredential, AccessInfo, InstallationResponse


class InstallationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        # Cache of raw template `access` blocks keyed by app_id (per request)
        self._access_cache: dict[int, dict | None] = {}

    async def list_installations(
        self, user: User, page: int = 1, per_page: int = 20
    ) -> PaginatedResponse[InstallationResponse]:
        query = (
            select(Installation)
            .where(Installation.user_id == user.id)
            .order_by(Installation.created_at.desc())
        )
        count_q = select(func.count()).select_from(Installation).where(
            Installation.user_id == user.id
        )
        total = (await self.db.execute(count_q)).scalar() or 0
        result = await self.db.execute(query.offset((page - 1) * per_page).limit(per_page))
        installations = result.scalars().all()

        items = []
        for inst in installations:
            items.append(await self._to_response(inst))

        return PaginatedResponse(items=items, total=total, page=page, per_page=per_page)

    async def get_installation(self, installation_id: int, user: User) -> InstallationResponse:
        inst = await self._get_owned(installation_id, user.id)
        return await self._to_response(inst)

    async def create_installation(
        self,
        user: User,
        app_id: int,
        config: Optional[dict] = None,
        llm_provider_id: Optional[int] = None,
        llm_model: Optional[str] = None,
    ) -> dict:
        await self._get_app(app_id)

        existing = await self.db.execute(
            select(Installation).where(
                Installation.app_id == app_id,
                Installation.user_id == user.id,
                Installation.status != InstallationStatus.uninstalling,
            )
        )
        if existing.scalar_one_or_none():
            raise InstallationConflict()

        installation = Installation(
            app_id=app_id,
            user_id=user.id,
            status=InstallationStatus.pending,
            config=json.dumps(config) if config else None,
            llm_provider_id=llm_provider_id,
            llm_model=llm_model,
        )
        self.db.add(installation)
        await self.db.flush()

        job = Job(
            type=JobType.install,
            installation_id=installation.id,
            status=JobStatus.pending,
        )
        self.db.add(job)
        await self.db.commit()
        await self.db.refresh(installation)
        await self.db.refresh(job)

        # Dispatch Celery task
        from ianoie.workers.tasks.install import install_app
        install_app.delay(installation.id, job.id)

        return {"installation_id": installation.id, "job_id": job.id}

    async def uninstall(self, installation_id: int, user: User) -> dict:
        inst = await self._get_owned(installation_id, user.id)

        inst.status = InstallationStatus.uninstalling
        job = Job(
            type=JobType.uninstall,
            installation_id=inst.id,
            status=JobStatus.pending,
        )
        self.db.add(job)
        await self.db.commit()
        await self.db.refresh(job)

        from ianoie.workers.tasks.uninstall import uninstall_app
        uninstall_app.delay(inst.id, job.id)

        return {"installation_id": inst.id, "job_id": job.id}

    async def start(self, installation_id: int, user: User) -> dict:
        inst = await self._get_owned(installation_id, user.id)

        job = Job(
            type=JobType.start,
            installation_id=inst.id,
            status=JobStatus.pending,
        )
        self.db.add(job)
        await self.db.commit()
        await self.db.refresh(job)

        from ianoie.workers.tasks.uninstall import start_app
        start_app.delay(inst.id, job.id)

        return {"installation_id": inst.id, "job_id": job.id}

    async def stop(self, installation_id: int, user: User) -> dict:
        inst = await self._get_owned(installation_id, user.id)

        job = Job(
            type=JobType.stop,
            installation_id=inst.id,
            status=JobStatus.pending,
        )
        self.db.add(job)
        await self.db.commit()
        await self.db.refresh(job)

        from ianoie.workers.tasks.uninstall import stop_app
        stop_app.delay(inst.id, job.id)

        return {"installation_id": inst.id, "job_id": job.id}

    async def restart(self, installation_id: int, user: User) -> dict:
        inst = await self._get_owned(installation_id, user.id)

        job = Job(
            type=JobType.restart,
            installation_id=inst.id,
            status=JobStatus.pending,
        )
        self.db.add(job)
        await self.db.commit()
        await self.db.refresh(job)

        from ianoie.workers.tasks.uninstall import restart_app
        restart_app.delay(inst.id, job.id)

        return {"installation_id": inst.id, "job_id": job.id}

    async def update_config(
        self, installation_id: int, user: User, config: dict,
        llm_provider_id: Optional[int] = None,
        llm_model: Optional[str] = None,
    ) -> dict:
        inst = await self._get_owned(installation_id, user.id)

        # Merge new config into existing config
        existing_config = json.loads(inst.config) if inst.config else {}
        existing_config.update(config)
        inst.config = json.dumps(existing_config)

        # Update LLM fields if provided
        if llm_provider_id is not None:
            inst.llm_provider_id = llm_provider_id
        if llm_model is not None:
            inst.llm_model = llm_model

        job = Job(
            type=JobType.reconfigure,
            installation_id=inst.id,
            status=JobStatus.pending,
        )
        self.db.add(job)
        await self.db.commit()
        await self.db.refresh(job)

        from ianoie.workers.tasks.reconfigure import reconfigure_app
        reconfigure_app.delay(inst.id, job.id)

        return {"installation_id": inst.id, "job_id": job.id}

    # --- private helpers ---

    async def _get_app(self, app_id: int) -> App:
        result = await self.db.execute(select(App).where(App.id == app_id))
        app = result.scalar_one_or_none()
        if not app:
            raise AppNotFound(str(app_id))
        return app

    async def _get_owned(self, installation_id: int, user_id: int) -> Installation:
        result = await self.db.execute(
            select(Installation).where(
                Installation.id == installation_id,
                Installation.user_id == user_id,
            )
        )
        inst = result.scalar_one_or_none()
        if not inst:
            raise InstallationNotFound(installation_id)
        return inst

    async def _to_response(self, inst: Installation) -> InstallationResponse:
        app_result = await self.db.execute(select(App).where(App.id == inst.app_id))
        app = app_result.scalar_one()

        # Resolve LLM provider info
        llm_provider_name = None
        llm_provider_type = None
        if inst.llm_provider_id:
            from ianoie.models.llm_provider import LLMProvider
            prov_result = await self.db.execute(
                select(LLMProvider).where(LLMProvider.id == inst.llm_provider_id)
            )
            provider = prov_result.scalar_one_or_none()
            if provider:
                llm_provider_name = provider.name
                llm_provider_type = provider.provider_type.value

        access = self._resolve_access(app, inst.id)

        return InstallationResponse(
            id=inst.id,
            app_id=inst.app_id,
            app_name=app.name,
            app_slug=app.slug,
            app_icon=app.icon_url,
            status=inst.status.value,
            container_id=inst.container_id,
            port=inst.port,
            domain=inst.domain,
            config=json.loads(inst.config) if inst.config else None,
            runtime_info=json.loads(inst.runtime_info) if inst.runtime_info else None,
            llm_provider_id=inst.llm_provider_id,
            llm_provider_name=llm_provider_name,
            llm_provider_type=llm_provider_type,
            llm_model=inst.llm_model,
            access=access,
            created_at=inst.created_at,
        )

    def _resolve_access(self, app: App, installation_id: int) -> Optional[AccessInfo]:
        """Resolve template-declared access info (URL + credentials) for an installation."""
        from ianoie.templates.loader import TemplateLoader

        if app.id not in self._access_cache:
            try:
                template = TemplateLoader().load(app.template_path)
                self._access_cache[app.id] = template.get("access") or None
            except Exception:
                self._access_cache[app.id] = None
        raw = self._access_cache[app.id]
        if not raw:
            return None
        url = raw.get("url")
        if url:
            url = url.replace("{installation_id}", str(installation_id))
        credentials = [AccessCredential(**c) for c in raw.get("credentials", [])]
        return AccessInfo(url=url or None, credentials=credentials, note=raw.get("note") or None)

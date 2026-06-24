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
from ianoie.schemas.installation import AccessCredential, AccessInfo, InstallationResponse, JobSummary


class InstallationService:
    def __init__(self, db: AsyncSession):
        self.db = db
        # Cache of loaded templates keyed by app_id (per request) — drives access resolution
        self._template_cache: dict[int, dict | None] = {}

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

        active_jobs = await self._active_jobs_map([i.id for i in installations])

        items = []
        for inst in installations:
            items.append(await self._to_response(inst, active_job=active_jobs.get(inst.id)))

        return PaginatedResponse(items=items, total=total, page=page, per_page=per_page)

    async def get_installation(self, installation_id: int, user: User) -> InstallationResponse:
        inst = await self._get_owned(installation_id, user.id)
        active_jobs = await self._active_jobs_map([inst.id])
        return await self._to_response(inst, active_job=active_jobs.get(inst.id))

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

    async def _active_jobs_map(self, installation_ids: list[int]) -> dict[int, Job]:
        """Latest non-terminal (pending/running) job per installation_id, in a single query.
        Drives the live progress bar on the UI without an N+1."""
        if not installation_ids:
            return {}
        stmt = (
            select(Job)
            .distinct(Job.installation_id)  # DISTINCT ON (installation_id) — Postgres
            .where(
                Job.installation_id.in_(installation_ids),
                Job.status.in_([JobStatus.pending, JobStatus.running]),
            )
            .order_by(Job.installation_id, Job.created_at.desc())
        )
        rows = (await self.db.execute(stmt)).scalars().all()
        return {j.installation_id: j for j in rows}

    @staticmethod
    def _job_summary(job: Optional[Job]) -> Optional[JobSummary]:
        if job is None:
            return None
        return JobSummary(
            id=job.id,
            type=job.type.value,
            status=job.status.value,
            progress=job.progress,
            error=job.error,
        )

    async def _to_response(
        self, inst: Installation, active_job: Optional[Job] = None
    ) -> InstallationResponse:
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

        access = self._resolve_access(app, inst.id, json.loads(inst.config) if inst.config else {})

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
            active_job=self._job_summary(active_job),
            created_at=inst.created_at,
        )

    def _resolve_access(
        self, app: App, installation_id: int, user_config: dict | None = None
    ) -> Optional[AccessInfo]:
        """Resolve template-declared access info (URL + credentials) for an installation.

        ``{{config.*}}`` placeholders in url/credentials/note are interpolated from the
        installation's config, with template field defaults applied — mirrors
        templates.renderer._render_env.
        """
        from ianoie.templates.loader import TemplateLoader

        if app.id not in self._template_cache:
            try:
                self._template_cache[app.id] = TemplateLoader().load(app.template_path)
            except Exception:
                self._template_cache[app.id] = None
        template = self._template_cache[app.id]
        if not template:
            return None
        raw = template.get("access")
        if not raw:
            return None

        # Apply config field defaults so {{config.*}} always resolves
        cfg = dict(user_config or {})
        for field in template.get("config", []):
            key = field.get("key")
            if key and "default" in field and cfg.get(key) in (None, ""):
                cfg[key] = field["default"]

        def _interp(value):
            if not isinstance(value, str):
                return value
            for config_key, config_val in cfg.items():
                value = value.replace(f"{{{{config.{config_key}}}}}", str(config_val))
            return value

        url = _interp(raw.get("url"))
        if url:
            url = url.replace("{installation_id}", str(installation_id))
        credentials = [
            AccessCredential(label=c.get("label", ""), value=_interp(c.get("value")) or "")
            for c in raw.get("credentials", [])
        ]
        note = _interp(raw.get("note"))
        return AccessInfo(url=url or None, credentials=credentials, note=note or None)

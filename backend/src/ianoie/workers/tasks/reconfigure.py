import json

import structlog

from ianoie.workers.celery_app import celery_app

logger = structlog.get_logger()


def _get_sync_db():
    from ianoie.database import sync_session_factory
    return sync_session_factory()


def _get_docker_client():
    from ianoie.docker_ops.client import get_docker_client
    return get_docker_client()


def _update_job(db, job_id: int, status, progress: float = None, error: str = None):
    from ianoie.models.job import Job
    if not job_id:
        return
    job = db.get(Job, int(job_id))
    if job:
        job.status = status
        if progress is not None:
            job.progress = progress
        if error:
            job.error = error
        db.commit()


def _resolve_llm_config(installation) -> dict | None:
    """Load LLM provider config for container injection."""
    if not installation.llm_provider_id:
        return None

    from ianoie.core.crypto import decrypt_api_key
    from ianoie.models.llm_provider import LLMProvider

    db = _get_sync_db()
    try:
        provider = db.get(LLMProvider, installation.llm_provider_id)
        if not provider:
            logger.warning("llm_provider_not_found", provider_id=installation.llm_provider_id)
            return None

        api_key = decrypt_api_key(provider.api_key_encrypted) if provider.api_key_encrypted else ""
        return {
            "provider_type": provider.provider_type.value,
            "api_key": api_key,
            "base_url": provider.base_url or "",
            "model": installation.llm_model or "",
        }
    finally:
        db.close()


@celery_app.task(bind=True, max_retries=2, default_retry_delay=10)
def reconfigure_app(self, installation_id: int, job_id: int):
    """Reconfigure an installation by recreating containers with updated config."""
    from ianoie.docker_ops.container_manager import ContainerManager, wait_for_port
    from ianoie.docker_ops.gpu_detector import GPUDetector
    from ianoie.docker_ops.image_manager import ImageManager
    from ianoie.models.app import App
    from ianoie.models.installation import Installation, InstallationStatus
    from ianoie.models.job import JobStatus
    from ianoie.templates.loader import TemplateLoader
    from ianoie.templates.renderer import TemplateRenderer
    from ianoie.workers.tasks._images import ensure_image

    db = _get_sync_db()
    docker_client = _get_docker_client()
    container_mgr = None
    created_ids: list[str] = []

    try:
        _update_job(db, job_id, JobStatus.running, 0.0)

        installation = db.get(Installation, installation_id)
        app = db.get(App, installation.app_id)

        # Load updated config
        user_config = json.loads(installation.config or "{}")

        # Stop and remove existing containers (preserve volumes)
        old_container_ids = json.loads(installation.container_ids or "[]")
        if not old_container_ids and installation.container_id:
            old_container_ids = [installation.container_id]

        container_mgr = ContainerManager(docker_client)
        image_mgr = ImageManager(docker_client)
        for cid in old_container_ids:
            try:
                container_mgr.stop(cid, timeout=30)
                logger.info("container_stopped", container_id=cid[:12])
            except Exception:
                pass
            try:
                container_mgr.remove(cid)
                logger.info("container_removed", container_id=cid[:12])
            except Exception:
                pass

        _update_job(db, job_id, JobStatus.running, 0.3)

        # Re-render template with new config
        template = TemplateLoader().load(app.template_path)

        # Resolve GPU allocation — graceful handling
        gpu_uuids = []
        gpu_required = template.get("gpu", {}).get("required", False)
        detector = GPUDetector()

        if gpu_required and not detector.available:
            raise RuntimeError(
                "This app requires a GPU but no GPU was detected on this system"
            )

        if detector.available:
            if gpu_required or user_config.get("gpu_indices") or user_config.get("gpu_index"):
                gpu_indices = user_config.get("gpu_indices")
                if gpu_indices is None and user_config.get("gpu_index") is not None:
                    gpu_indices = [user_config["gpu_index"]]
                if gpu_indices:
                    gpu_uuids = [detector.get_gpu_uuid(i) for i in gpu_indices]
                elif gpu_required:
                    all_gpus = detector.get_all_gpus()
                    if all_gpus:
                        gpu_uuids = [min(all_gpus, key=lambda g: g["utilization_gpu"])["uuid"]]

        # LLM config resolution
        llm_config = _resolve_llm_config(installation)
        if llm_config:
            logger.info(
                "llm_config_resolved",
                provider=llm_config["provider_type"],
                model=llm_config["model"],
            )

        renderer = TemplateRenderer()
        container_configs = renderer.render(
            template, user_config, installation_id, gpu_uuids,
            app_slug=app.slug, llm_config=llm_config,
        )

        # Create and start new containers with updated config
        for i, cfg in enumerate(container_configs):
            progress = 0.3 + (0.5 * (i / max(len(container_configs), 1)))
            _update_job(db, job_id, JobStatus.running, progress)

            # Reconfiguring only changes config, not the image — but the image may
            # have been pruned while the app was stopped, so ensure it exists first.
            ensure_image(image_mgr, cfg, installation_id)

            container = container_mgr.create(cfg)
            container_mgr.start(container.id)
            created_ids.append(container.id)
            logger.info("container_recreated", name=cfg.name, id=container.id[:12])

            if cfg.readiness_port:
                ready = wait_for_port(cfg.name, cfg.readiness_port, timeout=180)
                if not ready:
                    raise RuntimeError(
                        f"Container {cfg.name} did not become ready on port {cfg.readiness_port}"
                    )
                logger.info("container_ready", name=cfg.name, port=cfg.readiness_port)

        # Update installation record
        installation = db.get(Installation, installation_id)
        installation.status = InstallationStatus.running
        installation.container_id = created_ids[-1] if created_ids else None
        installation.container_ids = json.dumps(created_ids)
        installation.runtime_info = json.dumps({
            "gpu_uuids": gpu_uuids,
            "containers": [{"name": c.name, "image": c.image} for c in container_configs],
        })
        db.commit()

        _update_job(db, job_id, JobStatus.completed, 1.0)
        logger.info("reconfigure_completed", installation_id=installation_id)

    except Exception as e:
        logger.error("reconfigure_failed", installation_id=installation_id, error=str(e))
        if container_mgr:
            for cid in created_ids:
                try:
                    container_mgr.remove(cid, force=True)
                    logger.info("rollback_removed_container", container_id=cid[:12])
                except Exception as rm_err:
                    logger.warning("rollback_failed", container_id=cid[:12], error=str(rm_err))
        _update_job(db, job_id, JobStatus.failed, error=str(e))
        _update_installation_status(db, installation_id, InstallationStatus.error)
        db.close()
        raise self.retry(exc=e, countdown=10 * (self.request.retries + 1))

    finally:
        db.close()


def _update_installation_status(db, installation_id: int, status):
    from ianoie.models.installation import Installation
    installation = db.get(Installation, installation_id)
    if installation:
        installation.status = status
        db.commit()
    return installation

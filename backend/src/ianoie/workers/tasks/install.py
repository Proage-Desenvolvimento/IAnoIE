import json
import time

import structlog
from celery import shared_task, current_task

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


def _update_installation_status(db, installation_id: int, status):
    from ianoie.models.installation import Installation
    installation = db.get(Installation, installation_id)
    if installation:
        installation.status = status
        db.commit()
    return installation


@celery_app.task(bind=True, max_retries=3, default_retry_delay=10)
def install_app(self, installation_id: int, job_id: int):
    from ianoie.models.job import JobStatus
    from ianoie.models.installation import Installation, InstallationStatus
    from ianoie.models.app import App
    from ianoie.templates.loader import TemplateLoader
    from ianoie.templates.renderer import TemplateRenderer
    from ianoie.docker_ops.container_manager import ContainerManager
    from ianoie.docker_ops.image_manager import ImageManager
    from ianoie.docker_ops.network_manager import NetworkManager
    from ianoie.docker_ops.gpu_detector import GPUDetector

    db = _get_sync_db()
    docker_client = _get_docker_client()

    try:
        _update_job(db, job_id, JobStatus.running, 0.0)
        installation = _update_installation_status(db, installation_id, InstallationStatus.installing)

        app = db.get(App, installation.app_id)
        template = TemplateLoader().load(app.template_path)
        user_config = json.loads(installation.config or "{}")

        # GPU allocation
        gpu_uuids = []
        if template.get("gpu", {}).get("required"):
            detector = GPUDetector()
            gpu_indices = user_config.get("gpu_indices")
            if gpu_indices is None and user_config.get("gpu_index") is not None:
                gpu_indices = [user_config["gpu_index"]]
            if gpu_indices:
                gpu_uuids = [detector.get_gpu_uuid(i) for i in gpu_indices]
            else:
                all_gpus = detector.get_all_gpus()
                if all_gpus:
                    gpu_uuids = [min(all_gpus, key=lambda g: g["utilization_gpu"])["uuid"]]

        # Ensure proxy network
        network_mgr = NetworkManager(docker_client)
        network_mgr.ensure_proxy_network()

        # Render container configs from template
        renderer = TemplateRenderer()
        container_configs = renderer.render(
            template, user_config, installation_id, gpu_uuids
        )

        # Pull images and create containers in dependency order
        image_mgr = ImageManager(docker_client)
        container_mgr = ContainerManager(docker_client)
        created_ids = []

        for i, cfg in enumerate(container_configs):
            progress = 0.1 + (0.7 * (i / max(len(container_configs), 1)))
            _update_job(db, job_id, JobStatus.running, progress)

            # Pull image if not present
            image_parts = cfg.image.split(":")
            img_name = image_parts[0]
            img_tag = image_parts[1] if len(image_parts) > 1 else "latest"

            if not image_mgr.exists(cfg.image):
                logger.info("pulling_image", image=cfg.image)
                image_mgr.pull(img_name, img_tag)

            container = container_mgr.create(cfg)
            container_mgr.start(container.id)
            created_ids.append(container.id)
            logger.info("container_started", name=cfg.name, id=container.id[:12])

            if cfg.healthcheck:
                healthy = container_mgr.wait_healthy(container.id, timeout=180)
                if not healthy:
                    raise RuntimeError(f"Container {cfg.name} failed health check")
                logger.info("container_healthy", name=cfg.name)

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
        logger.info("install_completed", installation_id=installation_id)

    except Exception as e:
        logger.error("install_failed", installation_id=installation_id, error=str(e))
        _update_job(db, job_id, JobStatus.failed, error=str(e))
        _update_installation_status(db, installation_id, InstallationStatus.error)
        db.close()
        raise self.retry(exc=e, countdown=10 * (self.request.retries + 1))

    finally:
        db.close()

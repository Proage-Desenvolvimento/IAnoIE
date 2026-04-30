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


@celery_app.task(bind=True, max_retries=2, default_retry_delay=5)
def uninstall_app(self, installation_id: int, job_id: int):
    from ianoie.models.job import JobStatus
    from ianoie.models.installation import Installation, InstallationStatus
    from ianoie.docker_ops.container_manager import ContainerManager
    from ianoie.docker_ops.volume_manager import VolumeManager

    db = _get_sync_db()
    docker_client = _get_docker_client()

    try:
        _update_job(db, job_id, JobStatus.running, 0.0)

        installation = db.get(Installation, installation_id)
        installation.status = InstallationStatus.uninstalling
        db.commit()

        container_ids = json.loads(installation.container_ids or "[]")
        if not container_ids and installation.container_id:
            container_ids = [installation.container_id]

        container_mgr = ContainerManager(docker_client)
        for cid in container_ids:
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

        vol_mgr = VolumeManager(docker_client)
        vol_mgr.remove_installation_volumes(installation_id)

        db.delete(installation)
        db.commit()

        _update_job(db, job_id, JobStatus.completed, 1.0)
        logger.info("uninstall_completed", installation_id=installation_id)

    except Exception as e:
        logger.error("uninstall_failed", installation_id=installation_id, error=str(e))
        _update_job(db, job_id, JobStatus.failed, error=str(e))
        db.close()
        raise self.retry(exc=e)

    finally:
        db.close()


@celery_app.task(bind=True, max_retries=2)
def start_app(self, installation_id: int, job_id: int):
    from ianoie.models.job import JobStatus
    from ianoie.models.installation import Installation, InstallationStatus
    from ianoie.docker_ops.container_manager import ContainerManager

    db = _get_sync_db()
    docker_client = _get_docker_client()

    try:
        _update_job(db, job_id, JobStatus.running, 0.0)

        installation = db.get(Installation, installation_id)
        container_ids = json.loads(installation.container_ids or "[]")
        if not container_ids and installation.container_id:
            container_ids = [installation.container_id]

        container_mgr = ContainerManager(docker_client)
        for cid in container_ids:
            try:
                container_mgr.start(cid)
            except Exception:
                pass

        installation.status = InstallationStatus.running
        db.commit()

        _update_job(db, job_id, JobStatus.completed, 1.0)

    except Exception as e:
        logger.error("start_failed", installation_id=installation_id, error=str(e))
        _update_job(db, job_id, JobStatus.failed, error=str(e))
        raise self.retry(exc=e)

    finally:
        db.close()


@celery_app.task(bind=True, max_retries=2)
def stop_app(self, installation_id: int, job_id: int):
    from ianoie.models.job import JobStatus
    from ianoie.models.installation import Installation, InstallationStatus
    from ianoie.docker_ops.container_manager import ContainerManager

    db = _get_sync_db()
    docker_client = _get_docker_client()

    try:
        _update_job(db, job_id, JobStatus.running, 0.0)

        installation = db.get(Installation, installation_id)
        container_ids = json.loads(installation.container_ids or "[]")
        if not container_ids and installation.container_id:
            container_ids = [installation.container_id]

        container_mgr = ContainerManager(docker_client)
        for cid in container_ids:
            try:
                container_mgr.stop(cid)
            except Exception:
                pass

        installation.status = InstallationStatus.stopped
        db.commit()

        _update_job(db, job_id, JobStatus.completed, 1.0)

    except Exception as e:
        logger.error("stop_failed", installation_id=installation_id, error=str(e))
        _update_job(db, job_id, JobStatus.failed, error=str(e))
        raise self.retry(exc=e)

    finally:
        db.close()


@celery_app.task(bind=True, max_retries=2)
def restart_app(self, installation_id: int, job_id: int):
    from ianoie.models.job import JobStatus
    from ianoie.models.installation import Installation, InstallationStatus
    from ianoie.docker_ops.container_manager import ContainerManager

    db = _get_sync_db()
    docker_client = _get_docker_client()

    try:
        _update_job(db, job_id, JobStatus.running, 0.0)

        installation = db.get(Installation, installation_id)
        container_ids = json.loads(installation.container_ids or "[]")
        if not container_ids and installation.container_id:
            container_ids = [installation.container_id]

        container_mgr = ContainerManager(docker_client)
        for cid in container_ids:
            try:
                container_mgr.stop(cid, timeout=10)
            except Exception:
                pass
        for cid in container_ids:
            try:
                container_mgr.start(cid)
            except Exception:
                pass

        installation.status = InstallationStatus.running
        db.commit()

        _update_job(db, job_id, JobStatus.completed, 1.0)

    except Exception as e:
        logger.error("restart_failed", installation_id=installation_id, error=str(e))
        _update_job(db, job_id, JobStatus.failed, error=str(e))
        raise self.retry(exc=e)

    finally:
        db.close()

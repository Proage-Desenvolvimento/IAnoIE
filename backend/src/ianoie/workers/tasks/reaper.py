import structlog

from ianoie.workers.celery_app import celery_app

logger = structlog.get_logger()


def _get_sync_db():
    from ianoie.database import sync_session_factory
    return sync_session_factory()


def _get_docker_client():
    from ianoie.docker_ops.client import get_docker_client
    return get_docker_client()


@celery_app.task(ignore_result=True)
def reap_orphan_containers():
    """Remove app containers whose ``Installation`` row no longer exists.

    Catches the orphan-container bug: an uninstall that deleted the DB row but
    left containers running because their stored IDs had gone stale (a
    reconfigure/update recreated them under new IDs whose commit never landed).
    Runs periodically via Celery beat.

    Safe because the API always creates the ``Installation`` row *before*
    creating containers, so a legit running container always has a matching row.
    Compose-defined infra (postgres/redis/traefik/...) has no
    ``ianoie.installation_id`` label and is therefore never eligible.
    """
    from sqlalchemy import select

    from ianoie.docker_ops.container_manager import ContainerManager
    from ianoie.docker_ops.volume_manager import VolumeManager
    from ianoie.models.installation import Installation

    db = _get_sync_db()
    docker_client = _get_docker_client()

    try:
        live_ids = set(db.execute(select(Installation.id)).scalars().all())

        container_mgr = ContainerManager(docker_client)
        managed = container_mgr.list_managed()

        # installation_id -> list of orphaned containers
        orphans: dict[int, list] = {}
        for container in managed:
            raw = (container.labels or {}).get("ianoie.installation_id")
            if raw is None:
                # No installation_id label => not an app installation (infra,
                # or a managed container that predates labels). Never reap.
                continue
            try:
                inst_id = int(raw)
            except (TypeError, ValueError):
                logger.warning(
                    "reaper_skip_bad_label", container_id=container.id[:12], label=raw,
                )
                continue
            if inst_id not in live_ids:
                orphans.setdefault(inst_id, []).append(container)

        if not orphans:
            logger.info("reaper_no_orphans", managed=len(managed))
            return

        vol_mgr = VolumeManager(docker_client)
        containers_removed = 0
        for inst_id, containers in orphans.items():
            for container in containers:
                try:
                    container.stop(timeout=30)
                except Exception:
                    pass
                try:
                    container.remove(force=True)
                    containers_removed += 1
                except Exception:
                    pass
            # Also remove the orphan's labeled volumes (mirrors uninstall).
            # Anonymous image volumes are intentionally left untouched.
            try:
                vol_mgr.remove_installation_volumes(inst_id)
            except Exception as e:
                logger.warning(
                    "reaper_volume_cleanup_failed", installation_id=inst_id, error=str(e),
                )
            logger.warning(
                "reaper_removed_orphan",
                installation_id=inst_id,
                containers=len(containers),
            )

        logger.info(
            "reaper_complete",
            orphans=len(orphans),
            containers_removed=containers_removed,
        )

    except Exception as e:
        logger.error("reaper_failed", error=str(e))
        db.rollback()
    finally:
        db.close()

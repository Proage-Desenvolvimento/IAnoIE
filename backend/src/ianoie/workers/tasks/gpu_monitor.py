import datetime

import structlog

from ianoie.workers.celery_app import celery_app

logger = structlog.get_logger()


@celery_app.task(ignore_result=True)
def collect_gpu_metrics():
    from ianoie.models.gpu_metrics import GPUMetrics
    from ianoie.docker_ops.gpu_detector import GPUDetector
    from ianoie.database import sync_session_factory
    from ianoie.config import settings

    try:
        detector = GPUDetector()
        gpus = detector.get_all_gpus()
    except Exception as e:
        logger.warning("gpu_detection_failed", error=str(e))
        return

    db = sync_session_factory()
    try:
        for gpu in gpus:
            metric = GPUMetrics(
                gpu_index=gpu["index"],
                gpu_uuid=gpu["uuid"],
                gpu_name=gpu["name"],
                utilization=gpu["utilization_gpu"],
                vram_used_mb=gpu["vram_used_mb"],
                vram_total_mb=gpu["vram_total_mb"],
                temperature=gpu["temperature"],
                power_usage_w=gpu["power_usage_w"],
            )
            db.add(metric)

        # Prune old metrics
        cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(
            days=settings.gpu_metrics_retention_days
        )
        from sqlalchemy import delete
        db.execute(delete(GPUMetrics).where(GPUMetrics.timestamp < cutoff))

        db.commit()
        logger.info("gpu_metrics_collected", count=len(gpus))

    except Exception as e:
        logger.error("gpu_metrics_failed", error=str(e))
        db.rollback()
    finally:
        db.close()

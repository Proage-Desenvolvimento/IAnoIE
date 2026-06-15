import datetime
import json

import structlog

from ianoie.workers.celery_app import celery_app

logger = structlog.get_logger()


@celery_app.task(ignore_result=True)
def collect_system_metrics():
    import psutil

    from ianoie.config import settings
    from ianoie.database import sync_session_factory
    from ianoie.models.system_metrics import SystemMetrics

    # Collect system metrics
    cpu_percent = psutil.cpu_percent(interval=1)
    cpu_count = psutil.cpu_count()
    mem = psutil.virtual_memory()
    disk = psutil.disk_usage("/")
    net = psutil.net_io_counters()

    # Optional GPU metrics
    gpu_data = None
    try:
        from ianoie.docker_ops.gpu_detector import GPUDetector
        detector = GPUDetector()
        if detector.available:
            gpus = detector.get_all_gpus()
            if gpus:
                gpu_data = json.dumps(gpus)
    except Exception:
        pass

    db = sync_session_factory()
    try:
        metric = SystemMetrics(
            cpu_percent=cpu_percent,
            cpu_count=cpu_count,
            memory_total=mem.total,
            memory_used=mem.used,
            memory_percent=mem.percent,
            disk_total=disk.total,
            disk_used=disk.used,
            disk_percent=disk.percent,
            net_bytes_sent=net.bytes_sent,
            net_bytes_recv=net.bytes_recv,
            gpu_metrics=gpu_data,
        )
        db.add(metric)

        # Prune old metrics
        retention_days = getattr(settings, "system_metrics_retention_days", 7)
        cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(days=retention_days)
        from sqlalchemy import delete
        db.execute(delete(SystemMetrics).where(SystemMetrics.timestamp < cutoff))

        db.commit()
        logger.info("system_metrics_collected", cpu=cpu_percent, mem=mem.percent, disk=disk.percent)

    except Exception as e:
        logger.error("system_metrics_failed", error=str(e))
        db.rollback()
    finally:
        db.close()

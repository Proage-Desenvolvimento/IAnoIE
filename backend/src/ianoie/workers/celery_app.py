from celery import Celery
from celery.schedules import crontab

from ianoie.config import settings

celery_app = Celery(
    "ianoie",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
)

celery_app.conf.update(
    task_serializer="json",
    accept_content=["json"],
    result_serializer="json",
    timezone="UTC",
    enable_utc=True,
    task_track_started=True,
    task_acks_late=True,
    worker_prefetch_multiplier=1,
    result_expires=86400,
)

celery_app.conf.beat_schedule = {
    "collect-gpu-metrics": {
        "task": "ianoie.workers.tasks.gpu_monitor.collect_gpu_metrics",
        "schedule": settings.gpu_poll_interval_seconds,
    },
}

celery_app.autodiscover_tasks(["ianoie.workers.tasks"])

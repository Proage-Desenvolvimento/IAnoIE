from celery import Celery

from ianoie.config import settings

celery_app = Celery(
    "ianoie",
    broker=settings.celery_broker_url,
    backend=settings.celery_result_backend,
    include=[
        "ianoie.workers.tasks.system_monitor",
        "ianoie.workers.tasks.gpu_monitor",
        "ianoie.workers.tasks.install",
        "ianoie.workers.tasks.uninstall",
        "ianoie.workers.tasks.reconfigure",
        "ianoie.workers.tasks.update",
        "ianoie.workers.tasks.reaper",
    ],
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
    "collect-system-metrics": {
        "task": "ianoie.workers.tasks.system_monitor.collect_system_metrics",
        "schedule": 30,
    },
    "reap-orphan-containers": {
        "task": "ianoie.workers.tasks.reaper.reap_orphan_containers",
        "schedule": settings.orphan_reaper_interval_seconds,
    },
}

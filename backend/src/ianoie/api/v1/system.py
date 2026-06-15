import json
from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from ianoie.api.deps import get_current_user
from ianoie.config import settings
from ianoie.database import get_db
from ianoie.models.system_metrics import SystemMetrics
from ianoie.models.user import User
from ianoie.schemas.system import SystemInfo, SystemMetricsPoint, SystemMetricsResponse

router = APIRouter()


@router.get("/info", response_model=SystemInfo)
async def system_info(
    _: Annotated[User, Depends(get_current_user)],
):
    from ianoie.docker_ops.client import get_docker_client
    from ianoie.docker_ops.gpu_detector import GPUDetector

    gpu_detector = GPUDetector()
    gpus = gpu_detector.get_all_gpus()

    docker_version = None
    try:
        client = get_docker_client()
        docker_version = client.version().get("Version")
    except Exception:
        pass

    return SystemInfo(
        app_name=settings.app_name,
        version="0.1.0",
        docker_version=docker_version,
        gpu_count=len(gpus),
        gpu_names=[g["name"] for g in gpus],
    )


@router.get("/metrics", response_model=SystemMetricsResponse)
async def get_system_metrics(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
):
    result = await db.execute(
        select(SystemMetrics).order_by(SystemMetrics.timestamp.desc()).limit(1)
    )
    metric = result.scalar_one_or_none()

    if not metric:
        return SystemMetricsResponse(
            cpu_percent=0, cpu_count=0,
            memory_total=0, memory_used=0, memory_percent=0,
            disk_total=0, disk_used=0, disk_percent=0,
            net_bytes_sent=0, net_bytes_recv=0,
            gpus=[], timestamp=func.now(),
        )

    gpus = json.loads(metric.gpu_metrics) if metric.gpu_metrics else []

    return SystemMetricsResponse(
        cpu_percent=metric.cpu_percent,
        cpu_count=metric.cpu_count,
        memory_total=int(metric.memory_total),
        memory_used=int(metric.memory_used),
        memory_percent=metric.memory_percent,
        disk_total=int(metric.disk_total),
        disk_used=int(metric.disk_used),
        disk_percent=metric.disk_percent,
        net_bytes_sent=int(metric.net_bytes_sent),
        net_bytes_recv=int(metric.net_bytes_recv),
        gpus=gpus,
        timestamp=metric.timestamp,
    )


@router.get("/metrics/history", response_model=list[SystemMetricsPoint])
async def get_system_metrics_history(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    hours: int = Query(24, ge=1, le=168),
):
    import datetime
    cutoff = datetime.datetime.now(datetime.timezone.utc) - datetime.timedelta(hours=hours)

    result = await db.execute(
        select(SystemMetrics)
        .where(SystemMetrics.timestamp >= cutoff)
        .order_by(SystemMetrics.timestamp.asc())
    )
    metrics = result.scalars().all()

    return [
        SystemMetricsPoint(
            timestamp=m.timestamp,
            cpu_percent=m.cpu_percent,
            memory_percent=m.memory_percent,
            disk_percent=m.disk_percent,
        )
        for m in metrics
    ]

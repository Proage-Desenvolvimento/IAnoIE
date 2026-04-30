from typing import Annotated

from fastapi import APIRouter, Depends

from ianoie.models.user import User
from ianoie.api.deps import get_current_user
from ianoie.config import settings
from ianoie.schemas.system import SystemInfo

router = APIRouter()


@router.get("/info", response_model=SystemInfo)
async def system_info(
    _: Annotated[User, Depends(get_current_user)],
):
    from ianoie.docker_ops.gpu_detector import GPUDetector
    from ianoie.docker_ops.client import get_docker_client

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

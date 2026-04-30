from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ianoie.database import get_db
from ianoie.models.user import User
from ianoie.api.deps import get_current_user
from ianoie.schemas.gpu import GPUStatusResponse

router = APIRouter()


@router.get("/status", response_model=GPUStatusResponse)
async def gpu_status(
    _: Annotated[User, Depends(get_current_user)],
):
    from ianoie.docker_ops.gpu_detector import GPUDetector

    detector = GPUDetector()
    gpus = detector.get_all_gpus()
    return GPUStatusResponse(gpus=gpus, count=len(gpus))

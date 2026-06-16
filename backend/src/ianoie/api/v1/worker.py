from typing import Annotated

from fastapi import APIRouter, Depends

from ianoie.api.deps import get_current_user
from ianoie.models.user import User
from ianoie.schemas.worker import WorkerHealthResponse
from ianoie.services.worker_service import WorkerService

router = APIRouter()


@router.get("/health", response_model=WorkerHealthResponse)
async def worker_health(_: Annotated[User, Depends(get_current_user)]):
    return await WorkerService().get_worker_health()

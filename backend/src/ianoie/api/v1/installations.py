from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy.ext.asyncio import AsyncSession

from ianoie.database import get_db
from ianoie.models.user import User
from ianoie.api.deps import get_current_user
from ianoie.schemas.installation import InstallationCreate, InstallationResponse
from ianoie.schemas.common import PaginatedResponse
from ianoie.services.installation_service import InstallationService

router = APIRouter()


@router.get("", response_model=PaginatedResponse[InstallationResponse])
async def list_installations(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    svc = InstallationService(db)
    return await svc.list_installations(current_user, page, per_page)


@router.post("", status_code=202)
async def create_installation(
    body: InstallationCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    svc = InstallationService(db)
    return await svc.create_installation(current_user, body.app_id, body.config)


@router.get("/{installation_id}", response_model=InstallationResponse)
async def get_installation(
    installation_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    svc = InstallationService(db)
    return await svc.get_installation(installation_id, current_user)


@router.delete("/{installation_id}", status_code=202)
async def delete_installation(
    installation_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    svc = InstallationService(db)
    return await svc.uninstall(installation_id, current_user)


@router.post("/{installation_id}/start", status_code=202)
async def start_installation(
    installation_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    svc = InstallationService(db)
    return await svc.start(installation_id, current_user)


@router.post("/{installation_id}/stop", status_code=202)
async def stop_installation(
    installation_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    svc = InstallationService(db)
    return await svc.stop(installation_id, current_user)


@router.post("/{installation_id}/restart", status_code=202)
async def restart_installation(
    installation_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    svc = InstallationService(db)
    return await svc.restart(installation_id, current_user)

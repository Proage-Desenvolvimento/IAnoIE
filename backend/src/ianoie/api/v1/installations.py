from typing import Annotated

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from ianoie.api.deps import get_current_user
from ianoie.database import get_db
from ianoie.models.app_log import AppLog
from ianoie.models.user import User
from ianoie.schemas.common import PaginatedResponse
from ianoie.schemas.installation import (
    AppLogResponse,
    InstallationConfigUpdate,
    InstallationCreate,
    InstallationResponse,
)
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
    return await svc.create_installation(
        current_user, body.app_id, body.config, body.llm_provider_id, body.llm_model,
    )


@router.get("/{installation_id}", response_model=InstallationResponse)
async def get_installation(
    installation_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    svc = InstallationService(db)
    return await svc.get_installation(installation_id, current_user)


@router.get("/{installation_id}/logs", response_model=list[AppLogResponse])
async def list_installation_logs(
    installation_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
    limit: int = Query(500, ge=1, le=2000),
):
    """Lifecycle events for an install (pull/start/ready/error) — polled live by the UI."""
    svc = InstallationService(db)
    await svc.get_installation(installation_id, current_user)  # ownership check (404)

    result = await db.execute(
        select(AppLog)
        .where(AppLog.installation_id == installation_id)
        .order_by(AppLog.timestamp.asc())
        .limit(limit)
    )
    return result.scalars().all()


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


@router.patch("/{installation_id}/config", status_code=202)
async def update_installation_config(
    installation_id: int,
    body: InstallationConfigUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    svc = InstallationService(db)
    return await svc.update_config(
        installation_id, current_user, body.config, body.llm_provider_id, body.llm_model,
    )

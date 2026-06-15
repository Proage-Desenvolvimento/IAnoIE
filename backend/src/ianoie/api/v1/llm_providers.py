from typing import Annotated

from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession

from ianoie.api.deps import get_current_user
from ianoie.database import get_db
from ianoie.models.user import User, UserRole
from ianoie.schemas.llm_provider import (
    LLMProviderCreate,
    LLMProviderResponse,
    LLMProviderTestResult,
    LLMProviderUpdate,
)
from ianoie.services.llm_provider_service import LLMProviderService

router = APIRouter()


def _require_admin(current_user: User) -> User:
    if current_user.role != UserRole.admin:
        from fastapi import HTTPException, status
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Admin access required",
        )
    return current_user


@router.get("", response_model=list[LLMProviderResponse])
async def list_providers(
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    svc = LLMProviderService(db)
    return await svc.list_providers()


@router.post("", response_model=LLMProviderResponse, status_code=201)
async def create_provider(
    body: LLMProviderCreate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    _require_admin(current_user)
    svc = LLMProviderService(db)
    return await svc.create_provider(body)


@router.get("/{provider_id}", response_model=LLMProviderResponse)
async def get_provider(
    provider_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    svc = LLMProviderService(db)
    return await svc.get_provider(provider_id)


@router.put("/{provider_id}", response_model=LLMProviderResponse)
async def update_provider(
    provider_id: int,
    body: LLMProviderUpdate,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    _require_admin(current_user)
    svc = LLMProviderService(db)
    return await svc.update_provider(provider_id, body)


@router.delete("/{provider_id}", status_code=204)
async def delete_provider(
    provider_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    _require_admin(current_user)
    svc = LLMProviderService(db)
    await svc.delete_provider(provider_id)


@router.post("/{provider_id}/test", response_model=LLMProviderTestResult)
async def test_provider_connection(
    provider_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    _require_admin(current_user)
    svc = LLMProviderService(db)
    return await svc.test_connection(provider_id)


@router.post("/{provider_id}/toggle", response_model=LLMProviderResponse)
async def toggle_provider(
    provider_id: int,
    db: Annotated[AsyncSession, Depends(get_db)],
    current_user: Annotated[User, Depends(get_current_user)],
):
    _require_admin(current_user)
    svc = LLMProviderService(db)
    return await svc.toggle_provider(provider_id)

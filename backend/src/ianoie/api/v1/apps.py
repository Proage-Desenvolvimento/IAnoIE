from typing import Annotated, Optional

from fastapi import APIRouter, Depends, Query
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from ianoie.database import get_db
from ianoie.models.app import App
from ianoie.models.user import User
from ianoie.api.deps import get_current_user
from ianoie.schemas.app import AppResponse, AppDetailResponse
from ianoie.schemas.common import PaginatedResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[AppResponse])
async def list_apps(
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
    category: Optional[str] = Query(None),
    search: Optional[str] = Query(None),
    page: int = Query(1, ge=1),
    per_page: int = Query(20, ge=1, le=100),
):
    query = select(App)
    count_query = select(func.count()).select_from(App)

    if category:
        query = query.where(App.category == category)
        count_query = count_query.where(App.category == category)
    if search:
        pattern = f"%{search}%"
        query = query.where(App.name.ilike(pattern) | App.description.ilike(pattern))
        count_query = count_query.where(
            App.name.ilike(pattern) | App.description.ilike(pattern)
        )

    total = (await db.execute(count_query)).scalar() or 0
    result = await db.execute(
        query.offset((page - 1) * per_page).limit(per_page).order_by(App.name)
    )
    apps = result.scalars().all()

    return PaginatedResponse(items=apps, total=total, page=page, per_page=per_page)


@router.get("/{slug}", response_model=AppDetailResponse)
async def get_app(
    slug: str,
    db: Annotated[AsyncSession, Depends(get_db)],
    _: Annotated[User, Depends(get_current_user)],
):
    result = await db.execute(select(App).where(App.slug == slug))
    app = result.scalar_one_or_none()
    if not app:
        from ianoie.core.exceptions import AppNotFound
        raise AppNotFound(slug)
    return app

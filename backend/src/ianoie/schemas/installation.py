import datetime
from typing import Any, Optional

from pydantic import BaseModel


class InstallationCreate(BaseModel):
    app_id: int
    config: Optional[dict[str, Any]] = None


class InstallationResponse(BaseModel):
    id: int
    app_id: int
    app_name: str
    app_slug: str
    app_icon: Optional[str] = None
    status: str
    container_id: Optional[str] = None
    port: Optional[int] = None
    domain: Optional[str] = None
    config: Optional[dict[str, Any]] = None
    runtime_info: Optional[dict[str, Any]] = None
    created_at: datetime.datetime

    model_config = {"from_attributes": True}

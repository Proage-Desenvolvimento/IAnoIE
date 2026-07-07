import datetime
from typing import Any, Optional

from pydantic import BaseModel


class InstallationCreate(BaseModel):
    app_id: int
    config: Optional[dict[str, Any]] = None
    llm_provider_id: Optional[int] = None
    llm_model: Optional[str] = None


class InstallationConfigUpdate(BaseModel):
    config: dict[str, Any]
    llm_provider_id: Optional[int] = None
    llm_model: Optional[str] = None


class AccessCredential(BaseModel):
    label: str
    value: str


class AccessInfo(BaseModel):
    url: Optional[str] = None
    credentials: list[AccessCredential] = []
    note: Optional[str] = None


class JobSummary(BaseModel):
    """Active (non-terminal) job for an installation — drives the live progress bar on the UI."""

    id: int
    type: str
    status: str
    progress: float
    error: Optional[str] = None

    model_config = {"from_attributes": True}


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
    llm_provider_id: Optional[int] = None
    llm_provider_name: Optional[str] = None
    llm_provider_type: Optional[str] = None
    llm_model: Optional[str] = None
    access: Optional[AccessInfo] = None
    active_job: Optional[JobSummary] = None
    last_error: Optional[str] = None
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


class AppLogResponse(BaseModel):
    id: int
    level: str
    message: str
    container_name: Optional[str] = None
    timestamp: datetime.datetime

    model_config = {"from_attributes": True}

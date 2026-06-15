import datetime
from typing import Optional

from pydantic import BaseModel

from ianoie.models.llm_provider import LLMProviderType


class LLMProviderCreate(BaseModel):
    name: str
    provider_type: LLMProviderType
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    is_default: bool = False


class LLMProviderUpdate(BaseModel):
    name: Optional[str] = None
    api_key: Optional[str] = None
    base_url: Optional[str] = None
    models: Optional[list[str]] = None
    is_default: Optional[bool] = None
    enabled: Optional[bool] = None


class LLMProviderResponse(BaseModel):
    id: int
    name: str
    provider_type: str
    base_url: Optional[str] = None
    models: list[str]
    is_default: bool
    enabled: bool
    has_api_key: bool
    created_at: datetime.datetime

    model_config = {"from_attributes": True}


class LLMProviderTestResult(BaseModel):
    success: bool
    message: str
    models: list[str] = []

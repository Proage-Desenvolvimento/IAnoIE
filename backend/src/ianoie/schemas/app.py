import json
from typing import Optional

from pydantic import BaseModel, field_validator


class AppResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    category: str
    icon_url: Optional[str] = None
    version: str
    gpu_requirements: Optional[dict] = None

    @field_validator("gpu_requirements", mode="before")
    @classmethod
    def parse_gpu_requirements(cls, v):
        if isinstance(v, str):
            try:
                return json.loads(v)
            except (json.JSONDecodeError, TypeError):
                return None
        return v

    model_config = {"from_attributes": True}


class AppDetailResponse(AppResponse):
    requirements: Optional[str] = None

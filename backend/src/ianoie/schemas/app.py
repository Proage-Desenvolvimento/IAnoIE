from typing import Optional

from pydantic import BaseModel


class AppResponse(BaseModel):
    id: int
    name: str
    slug: str
    description: str
    category: str
    icon_url: Optional[str] = None
    version: str
    gpu_requirements: Optional[dict] = None

    model_config = {"from_attributes": True}


class AppDetailResponse(AppResponse):
    requirements: Optional[str] = None

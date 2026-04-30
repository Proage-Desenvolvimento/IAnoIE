import datetime
from typing import Optional

from pydantic import BaseModel


class JobResponse(BaseModel):
    id: int
    type: str
    installation_id: Optional[int] = None
    status: str
    progress: float
    error: Optional[str] = None
    created_at: datetime.datetime

    model_config = {"from_attributes": True}

import datetime

from pydantic import BaseModel


class WorkerNodeInfo(BaseModel):
    name: str
    active: int
    processed: int | None = None
    pool: str | None = None


class WorkerHealthResponse(BaseModel):
    status: str  # "healthy" | "unhealthy"
    workers_online: int
    active_tasks: int
    broker_online: bool
    workers: list[WorkerNodeInfo]
    timestamp: datetime.datetime

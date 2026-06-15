import datetime

from pydantic import BaseModel


class SystemInfo(BaseModel):
    app_name: str
    version: str
    docker_version: str | None = None
    gpu_count: int
    gpu_names: list[str]


class SystemMetricsResponse(BaseModel):
    cpu_percent: float
    cpu_count: int
    memory_total: int
    memory_used: int
    memory_percent: float
    disk_total: int
    disk_used: int
    disk_percent: float
    net_bytes_sent: int
    net_bytes_recv: int
    gpus: list[dict] = []
    timestamp: datetime.datetime


class SystemMetricsPoint(BaseModel):
    timestamp: datetime.datetime
    cpu_percent: float
    memory_percent: float
    disk_percent: float

from pydantic import BaseModel


class SystemInfo(BaseModel):
    app_name: str
    version: str
    docker_version: str | None = None
    gpu_count: int
    gpu_names: list[str]

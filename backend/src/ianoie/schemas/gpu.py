from pydantic import BaseModel


class GPUInfo(BaseModel):
    index: int
    uuid: str
    name: str
    utilization_gpu: float
    utilization_memory: float
    vram_used_mb: float
    vram_total_mb: float
    vram_free_mb: float
    temperature: float
    power_usage_w: float


class GPUStatusResponse(BaseModel):
    gpus: list[GPUInfo]
    count: int

import datetime

from sqlalchemy import Integer, Float, String, DateTime
from sqlalchemy import func
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class GPUMetrics(Base):
    __tablename__ = "gpu_metrics"

    id: Mapped[int] = mapped_column(primary_key=True)
    gpu_index: Mapped[int] = mapped_column(Integer, index=True)
    gpu_uuid: Mapped[str] = mapped_column(String(100))
    gpu_name: Mapped[str] = mapped_column(String(200))
    utilization: Mapped[float] = mapped_column(Float)
    vram_used_mb: Mapped[float] = mapped_column(Float)
    vram_total_mb: Mapped[float] = mapped_column(Float)
    temperature: Mapped[float] = mapped_column(Float)
    power_usage_w: Mapped[float] = mapped_column(Float)
    timestamp: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )

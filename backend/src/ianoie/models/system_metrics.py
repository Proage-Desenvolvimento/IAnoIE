import datetime
from typing import Optional

from sqlalchemy import DateTime, Float, Integer, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from .base import Base


class SystemMetrics(Base):
    __tablename__ = "system_metrics"

    id: Mapped[int] = mapped_column(primary_key=True)
    cpu_percent: Mapped[float] = mapped_column(Float)
    cpu_count: Mapped[int] = mapped_column(Integer)
    memory_total: Mapped[float] = mapped_column(Float)
    memory_used: Mapped[float] = mapped_column(Float)
    memory_percent: Mapped[float] = mapped_column(Float)
    disk_total: Mapped[float] = mapped_column(Float)
    disk_used: Mapped[float] = mapped_column(Float)
    disk_percent: Mapped[float] = mapped_column(Float)
    net_bytes_sent: Mapped[float] = mapped_column(Float)
    net_bytes_recv: Mapped[float] = mapped_column(Float)
    gpu_metrics: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    timestamp: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True,
    )

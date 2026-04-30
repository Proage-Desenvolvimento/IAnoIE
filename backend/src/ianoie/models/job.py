import datetime
import enum
from typing import Optional

from sqlalchemy import String, Text, Float, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class JobType(str, enum.Enum):
    install = "install"
    uninstall = "uninstall"
    start = "start"
    stop = "stop"
    restart = "restart"
    backup = "backup"
    update = "update"


class JobStatus(str, enum.Enum):
    pending = "pending"
    running = "running"
    completed = "completed"
    failed = "failed"
    cancelled = "cancelled"


class Job(Base, TimestampMixin):
    __tablename__ = "jobs"

    id: Mapped[int] = mapped_column(primary_key=True)
    type: Mapped[JobType] = mapped_column(SAEnum(JobType))
    installation_id: Mapped[Optional[int]] = mapped_column(
        ForeignKey("installations.id"), nullable=True
    )
    status: Mapped[JobStatus] = mapped_column(
        SAEnum(JobStatus), default=JobStatus.pending, index=True
    )
    progress: Mapped[float] = mapped_column(Float, default=0.0)
    error: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    celery_task_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)

    installation: Mapped[Optional["Installation"]] = relationship(back_populates="jobs")  # noqa: F821

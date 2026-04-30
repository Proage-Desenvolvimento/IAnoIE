import datetime
import enum
from typing import Optional

from sqlalchemy import String, Text, ForeignKey, Enum as SAEnum, DateTime
from sqlalchemy import func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base


class LogLevel(str, enum.Enum):
    debug = "debug"
    info = "info"
    warn = "warn"
    error = "error"


class AppLog(Base):
    __tablename__ = "app_logs"

    id: Mapped[int] = mapped_column(primary_key=True)
    installation_id: Mapped[int] = mapped_column(
        ForeignKey("installations.id", ondelete="CASCADE")
    )
    level: Mapped[LogLevel] = mapped_column(
        SAEnum(LogLevel, name="log_level"), default=LogLevel.info
    )
    message: Mapped[str] = mapped_column(Text)
    timestamp: Mapped[datetime.datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), index=True
    )
    container_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    installation: Mapped["Installation"] = relationship(back_populates="logs")  # noqa: F821

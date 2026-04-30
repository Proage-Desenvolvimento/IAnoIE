import datetime
import enum
from typing import Optional

from sqlalchemy import String, Text, Integer, ForeignKey, Enum as SAEnum
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class InstallationStatus(str, enum.Enum):
    pending = "pending"
    installing = "installing"
    running = "running"
    stopped = "stopped"
    error = "error"
    uninstalling = "uninstalling"


class Installation(Base, TimestampMixin):
    __tablename__ = "installations"

    id: Mapped[int] = mapped_column(primary_key=True)
    app_id: Mapped[int] = mapped_column(ForeignKey("apps.id", ondelete="CASCADE"))
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"))
    status: Mapped[InstallationStatus] = mapped_column(
        SAEnum(InstallationStatus, name="installation_status"),
        default=InstallationStatus.pending,
        index=True,
    )
    container_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    container_ids: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    port: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    domain: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    config: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    runtime_info: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    app: Mapped["App"] = relationship(back_populates="installations")  # noqa: F821
    user: Mapped["User"] = relationship(back_populates="installations")  # noqa: F821
    logs: Mapped[list["AppLog"]] = relationship(  # noqa: F821
        back_populates="installation", cascade="all, delete-orphan"
    )
    jobs: Mapped[list["Job"]] = relationship(back_populates="installation")  # noqa: F821

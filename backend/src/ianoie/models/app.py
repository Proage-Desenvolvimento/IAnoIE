import datetime
from typing import List, Optional

from sqlalchemy import String, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship

from .base import Base, TimestampMixin


class App(Base, TimestampMixin):
    __tablename__ = "apps"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(255), unique=True)
    slug: Mapped[str] = mapped_column(String(100), unique=True, index=True)
    description: Mapped[str] = mapped_column(Text)
    category: Mapped[str] = mapped_column(String(100), index=True)
    template_path: Mapped[str] = mapped_column(String(500))
    icon_url: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    version: Mapped[str] = mapped_column(String(50))
    requirements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    gpu_requirements: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    installations: Mapped[List["Installation"]] = relationship(back_populates="app")  # noqa: F821

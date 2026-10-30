from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, TIMESTAMP, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class Collection(Base):
    """A collection of the library's digital library, shown on the Collections page and linked to dlib.me."""

    __tablename__ = "collections"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[dict[str, str]] = mapped_column(JSON)
    text: Mapped[dict[str, str]] = mapped_column(JSON)
    href: Mapped[str] = mapped_column(Text)
    image: Mapped[str] = mapped_column(Text)
    # Collections are shown by position, then by id.
    position: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )

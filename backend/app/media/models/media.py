from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from sqlalchemy import TIMESTAMP, CheckConstraint, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class MediaType(StrEnum):
    """What an upload may be: raster pictures and two video formats (never SVG or HTML)."""

    JPEG = "image/jpeg"
    PNG = "image/png"
    WEBP = "image/webp"
    GIF = "image/gif"
    MP4 = "video/mp4"
    WEBM = "video/webm"


_TYPE_LIST = ", ".join(f"'{kind.value}'" for kind in MediaType)


class MediaAsset(Base):
    """A picture or a video in the media library, with the author and licence the site must show."""

    __tablename__ = "media_assets"
    __table_args__ = (
        CheckConstraint(f"content_type IN ({_TYPE_LIST})", name="content_type_known"),
        CheckConstraint("size > 0", name="size_positive"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    # The name on disk: random, with an extension the server decided from the file's content.
    stored_name: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    # The name the uploader's file had; only shown, never used as a path.
    filename: Mapped[str] = mapped_column(String(200))
    content_type: Mapped[str] = mapped_column(String(20))
    size: Mapped[int] = mapped_column()
    credit: Mapped[str] = mapped_column(String(200))
    license: Mapped[str] = mapped_column(String(100))
    source_url: Mapped[str | None] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    uploaded_by_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), index=True
    )

    @property
    def url(self) -> str:
        return f"/media/{self.stored_name}"

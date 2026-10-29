from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import TYPE_CHECKING, Any

from sqlalchemy import JSON, TIMESTAMP, CheckConstraint, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.users.models.user import User


class ExhibitionTemplate(StrEnum):
    TIMELINE = "timeline"
    GALLERY = "gallery"
    MAP = "map"
    SLIDER = "slider"
    ROOM = "room"
    BOOK = "book"
    CAROUSEL = "carousel"
    CARDS = "cards"


class ExhibitionStatus(StrEnum):
    DRAFT = "draft"
    PENDING = "pending"
    PUBLISHED = "published"


class ItemType(StrEnum):
    BOOK = "book"
    MANUSCRIPT = "manuscript"
    MAP = "map"
    PHOTO = "photo"
    PERIODICAL = "periodical"
    POSTER = "poster"
    AUDIO = "audio"


def _values(enum: type[StrEnum]) -> str:
    return ", ".join(f"'{member.value}'" for member in enum)


# Texts in both languages are stored as `{"me": "...", "en": "..."}` (JSON works on SQLite and Postgres alike).
# An exhibition owns its sections, their objects and its videos: they are written and deleted with it,
# so the four tables live in one module (the aggregate), and a PATCH replaces the lists as a whole.


class Exhibition(Base):
    __tablename__ = "exhibitions"
    __table_args__ = (
        CheckConstraint(f"template IN ({_values(ExhibitionTemplate)})", name="template_known"),
        CheckConstraint(f"status IN ({_values(ExhibitionStatus)})", name="status_known"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    slug: Mapped[str] = mapped_column(String(160), unique=True, index=True)
    title: Mapped[dict[str, str]] = mapped_column(JSON)
    summary: Mapped[dict[str, str]] = mapped_column(JSON)
    intro: Mapped[dict[str, str] | None] = mapped_column(JSON)
    cover_url: Mapped[str] = mapped_column(Text)
    template: Mapped[str] = mapped_column(String(20), index=True)
    status: Mapped[str] = mapped_column(String(20), index=True)
    period: Mapped[str] = mapped_column(String(60))
    tags: Mapped[list[str]] = mapped_column(JSON, default=list)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    author_id: Mapped[int] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)

    author: Mapped[User] = relationship("User", back_populates="exhibitions")
    sections: Mapped[list[Section]] = relationship(
        "Section",
        back_populates="exhibition",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="Section.position",
    )
    videos: Mapped[list[ExhibitionVideo]] = relationship(
        "ExhibitionVideo",
        back_populates="exhibition",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="ExhibitionVideo.position",
    )

    @property
    def author_name(self) -> str:
        return self.author.name


class Section(Base):
    __tablename__ = "sections"
    __table_args__ = (
        CheckConstraint("year IS NULL OR (year >= 1000 AND year <= 2100)", name="year_in_range"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    exhibition_id: Mapped[int] = mapped_column(
        ForeignKey("exhibitions.id", ondelete="CASCADE"), index=True
    )
    position: Mapped[int] = mapped_column(default=0)
    title: Mapped[dict[str, str]] = mapped_column(JSON)
    text: Mapped[dict[str, str]] = mapped_column(JSON)
    year: Mapped[int | None] = mapped_column()
    # {"name": {"me", "en"}, "lat": number, "lng": number}; required by the map viewer only.
    place: Mapped[dict[str, Any] | None] = mapped_column(JSON)

    exhibition: Mapped[Exhibition] = relationship("Exhibition", back_populates="sections")
    items: Mapped[list[ExhibitionItem]] = relationship(
        "ExhibitionItem",
        back_populates="section",
        cascade="all, delete-orphan",
        passive_deletes=True,
        order_by="ExhibitionItem.position",
    )


class ExhibitionItem(Base):
    __tablename__ = "exhibition_items"
    __table_args__ = (CheckConstraint(f"type IN ({_values(ItemType)})", name="type_known"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    section_id: Mapped[int] = mapped_column(
        ForeignKey("sections.id", ondelete="CASCADE"), index=True
    )
    position: Mapped[int] = mapped_column(default=0)
    type: Mapped[str] = mapped_column(String(20))
    title: Mapped[dict[str, str]] = mapped_column(JSON)
    creator: Mapped[str] = mapped_column(String(200))
    year: Mapped[int | None] = mapped_column()
    collection: Mapped[str] = mapped_column(String(200))
    image_url: Mapped[str] = mapped_column(Text)
    source_url: Mapped[str] = mapped_column(Text)
    rights: Mapped[str] = mapped_column(String(200))
    signature: Mapped[str | None] = mapped_column(String(100))
    inventory_no: Mapped[str | None] = mapped_column(String(100))
    language: Mapped[str | None] = mapped_column(String(100))
    material: Mapped[str | None] = mapped_column(String(100))
    dimensions: Mapped[str | None] = mapped_column(String(100))

    section: Mapped[Section] = relationship("Section", back_populates="items")


class ExhibitionVideo(Base):
    __tablename__ = "exhibition_videos"

    id: Mapped[int] = mapped_column(primary_key=True)
    exhibition_id: Mapped[int] = mapped_column(
        ForeignKey("exhibitions.id", ondelete="CASCADE"), index=True
    )
    position: Mapped[int] = mapped_column(default=0)
    title: Mapped[dict[str, str]] = mapped_column(JSON)
    description: Mapped[dict[str, str]] = mapped_column(JSON)
    src: Mapped[str] = mapped_column(Text)
    credit: Mapped[str] = mapped_column(String(200))
    license: Mapped[str] = mapped_column(String(100))
    source_url: Mapped[str] = mapped_column(Text)

    exhibition: Mapped[Exhibition] = relationship("Exhibition", back_populates="videos")

from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import Any

from sqlalchemy import JSON, TIMESTAMP, CheckConstraint, Float, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class LibraryType(StrEnum):
    NATIONAL = "national"
    UNIVERSITY = "university"
    PUBLIC = "public"
    SPECIAL = "special"


class LocationPrecision(StrEnum):
    """`exact`: the library or its building; `town`: the centre of the town (approximate)."""

    EXACT = "exact"
    TOWN = "town"


def _values(enum: type[StrEnum]) -> str:
    return ", ".join(f"'{member.value}'" for member in enum)


class Library(Base):
    """A library of Montenegro shown on the interactive map."""

    __tablename__ = "libraries"
    __table_args__ = (
        CheckConstraint(f"type IN ({_values(LibraryType)})", name="type_known"),
        CheckConstraint(
            f"precision IS NULL OR precision IN ({_values(LocationPrecision)})",
            name="precision_known",
        ),
        # A position is all or nothing: a pin needs both coordinates and how exact they are.
        CheckConstraint(
            "(lat IS NULL AND lng IS NULL AND precision IS NULL)"
            " OR (lat IS NOT NULL AND lng IS NOT NULL AND precision IS NOT NULL)",
            name="location_complete",
        ),
        CheckConstraint(
            "lat IS NULL OR (lat >= -90 AND lat <= 90 AND lng >= -180 AND lng <= 180)",
            name="location_in_range",
        ),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(200))
    type: Mapped[str] = mapped_column(String(20), index=True)
    city: Mapped[str] = mapped_column(String(100), index=True)
    address: Mapped[str | None] = mapped_column(String(200))
    website: Mapped[str | None] = mapped_column(Text)
    email: Mapped[str | None] = mapped_column(String(254))
    phone: Mapped[str | None] = mapped_column(String(60))
    # {"me", "en"}: short facts, only where a source states them.
    description: Mapped[dict[str, str] | None] = mapped_column(JSON)
    # {"url", "credit", "license", "sourceUrl"}: a free photo of the building, with the credit to show.
    image: Mapped[dict[str, str] | None] = mapped_column(JSON)
    lat: Mapped[float | None] = mapped_column(Float)
    lng: Mapped[float | None] = mapped_column(Float)
    precision: Mapped[str | None] = mapped_column(String(10))
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )

    @property
    def location(self) -> dict[str, Any] | None:
        if self.lat is None or self.lng is None or self.precision is None:
            return None
        return {"lat": self.lat, "lng": self.lng, "precision": self.precision}

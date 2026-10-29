from __future__ import annotations

from datetime import datetime
from enum import StrEnum
from typing import TYPE_CHECKING

from sqlalchemy import TIMESTAMP, CheckConstraint, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base

if TYPE_CHECKING:
    from app.exhibitions.models.exhibition import Exhibition


class UserRole(StrEnum):
    """Visitors have no account: only the library's staff sign in."""

    CURATOR = "curator"
    ADMIN = "admin"


_ROLE_LIST = ", ".join(f"'{role.value}'" for role in UserRole)


class User(Base):
    __tablename__ = "users"
    __table_args__ = (CheckConstraint(f"role IN ({_ROLE_LIST})", name="role_known"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str] = mapped_column(String(254), unique=True, index=True)
    password_hash: Mapped[str] = mapped_column(String(128))
    name: Mapped[str] = mapped_column(String(80))
    role: Mapped[str] = mapped_column(String(20))
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )

    # One-to-many: User -> Exhibition. Deleting a user deletes their exhibitions (ON DELETE CASCADE).
    exhibitions: Mapped[list[Exhibition]] = relationship(
        "Exhibition", back_populates="author", cascade="all, delete-orphan", passive_deletes=True
    )

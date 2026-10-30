from __future__ import annotations

from datetime import datetime
from enum import StrEnum

from sqlalchemy import TIMESTAMP, CheckConstraint, ForeignKey, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class AuditAction(StrEnum):
    CREATE = "create"
    UPDATE = "update"
    DELETE = "delete"


class AuditEntityType(StrEnum):
    EXHIBITION = "exhibition"
    CONTENT = "content"
    LIBRARY = "library"
    COLLECTION = "collection"
    USER = "user"
    MEDIA = "media"


def _one_of(column: str, values: type[StrEnum]) -> str:
    return f"{column} IN ({', '.join(repr(v.value) for v in values)})"


class AuditEntry(Base):
    """One change made by a signed-in user, kept so an admin can see who changed what and when.

    The actor's name and the label of the changed thing are copied here on purpose: the entry must stay readable
    after the account or the record is gone. Only the fact of the change is stored, never passwords or file contents.
    """

    __tablename__ = "audit_entries"
    __table_args__ = (
        CheckConstraint(_one_of("action", AuditAction), name="action_allowed"),
        CheckConstraint(_one_of("entity_type", AuditEntityType), name="entity_type_allowed"),
    )

    id: Mapped[int] = mapped_column(primary_key=True)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), index=True
    )
    actor_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), index=True
    )
    actor_name: Mapped[str] = mapped_column(String(80))
    action: Mapped[str] = mapped_column(String(10))
    entity_type: Mapped[str] = mapped_column(String(20), index=True)
    # The id of the record, or the message key for site texts.
    entity_ref: Mapped[str] = mapped_column(String(80))
    label: Mapped[str] = mapped_column(String(200))
    detail: Mapped[str | None] = mapped_column(Text)

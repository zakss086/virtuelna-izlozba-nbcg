from __future__ import annotations

from datetime import datetime

from sqlalchemy import JSON, TIMESTAMP, ForeignKey, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class ContentBlock(Base):
    """A piece of site text an admin has edited, in both languages.

    The default text lives in the frontend (`messages-me.ts`, `messages-en.ts`); a row here overrides it,
    and deleting the row brings the default back.
    """

    __tablename__ = "content_blocks"

    id: Mapped[int] = mapped_column(primary_key=True)
    # The message key, e.g. "about.lead".
    key: Mapped[str] = mapped_column(String(80), unique=True, index=True)
    value: Mapped[dict[str, str]] = mapped_column(JSON)
    created_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now()
    )
    updated_at: Mapped[datetime] = mapped_column(
        TIMESTAMP(timezone=True), server_default=func.now(), onupdate=func.now()
    )
    updated_by_id: Mapped[int | None] = mapped_column(
        ForeignKey("users.id", ondelete="SET NULL"), index=True
    )

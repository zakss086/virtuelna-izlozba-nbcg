from __future__ import annotations

from app.utils.exceptions import ConflictException, NotFoundException


class ContentBlockNotFoundException(NotFoundException):
    def __init__(self) -> None:
        super().__init__(message="Content block not found", code="content_block_not_found")


class ContentBlockConflictException(ConflictException):
    def __init__(self) -> None:
        super().__init__(
            message="The text was changed at the same time, try again", code="content_conflict"
        )

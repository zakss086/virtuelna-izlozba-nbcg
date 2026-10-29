from __future__ import annotations

from app.utils.exceptions import ForbiddenException


class AdminOnlyException(ForbiddenException):
    def __init__(self) -> None:
        super().__init__(message="Only an admin can do this", code="admin_only")

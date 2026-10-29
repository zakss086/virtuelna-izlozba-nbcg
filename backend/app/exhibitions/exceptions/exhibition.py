from __future__ import annotations

from app.utils.exceptions import ConflictException, ForbiddenException, NotFoundException


class ExhibitionNotFoundException(NotFoundException):
    def __init__(self) -> None:
        super().__init__(message="Exhibition not found", code="exhibition_not_found")


class NotExhibitionAuthorException(ForbiddenException):
    def __init__(self) -> None:
        super().__init__(
            message="Only the author or an admin can change this exhibition",
            code="not_exhibition_author",
        )


class StatusChangeNotAllowedException(ForbiddenException):
    def __init__(self) -> None:
        message = "You are not allowed to set this status"
        super().__init__(
            message=message, code="status_change_not_allowed", field_errors={"status": message}
        )


class SlugTakenException(ConflictException):
    def __init__(self) -> None:
        super().__init__(message="Could not create a unique address", code="slug_taken")

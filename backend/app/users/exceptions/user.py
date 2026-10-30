from __future__ import annotations

from app.utils.exceptions import ConflictException, ForbiddenException, NotFoundException


class AdminOnlyException(ForbiddenException):
    def __init__(self) -> None:
        super().__init__(message="Only an admin can do this", code="admin_only")


class UserNotFoundException(NotFoundException):
    def __init__(self) -> None:
        super().__init__(message="User not found", code="user_not_found")


class EmailAlreadyRegisteredException(ConflictException):
    def __init__(self) -> None:
        message = "Email is already registered"
        super().__init__(
            message=message, code="email_already_registered", field_errors={"email": message}
        )


class CannotChangeOwnAccessException(ForbiddenException):
    """An admin cannot demote or switch off their own account, so the site always keeps an admin."""

    def __init__(self) -> None:
        super().__init__(
            message="You cannot change your own role or switch off your own account",
            code="cannot_change_own_access",
        )

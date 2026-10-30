from __future__ import annotations

from app.utils.exceptions import ForbiddenException, UnauthenticatedException


class InvalidCredentialsException(UnauthenticatedException):
    def __init__(self) -> None:
        # One message for a wrong email and a wrong password: the API must not reveal which emails exist.
        super().__init__(message="Invalid email or password", code="invalid_credentials")


class AccountDisabledException(ForbiddenException):
    """Said only after the right password, so it does not reveal which accounts exist."""

    def __init__(self) -> None:
        super().__init__(
            message="This account is switched off. Ask an admin.", code="account_disabled"
        )


class InvalidTokenException(UnauthenticatedException):
    def __init__(self) -> None:
        super().__init__(message="Invalid or expired token", code="invalid_token")


class NotAuthenticatedException(UnauthenticatedException):
    def __init__(self) -> None:
        super().__init__(message="Authentication required", code="not_authenticated")

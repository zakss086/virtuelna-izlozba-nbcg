from __future__ import annotations

from app.auth.schemas.auth import CurrentUser
from app.users.exceptions.user import AdminOnlyException
from app.users.models.user import UserRole


def require_admin(user: CurrentUser) -> None:
    """Raises `AdminOnlyException` (403) unless the signed-in user is an admin. Called in services, never in an endpoint."""
    if user.role != UserRole.ADMIN:
        raise AdminOnlyException

from __future__ import annotations

from pydantic import EmailStr, Field

from app.users.models.user import UserRole
from app.utils.schemas import CamelCaseModel, CamelCaseResponseModel, UtcDatetime


class UserCreateRequestSchema(CamelCaseModel):
    email: EmailStr
    name: str = Field(min_length=1, max_length=80)
    role: UserRole
    # bcrypt reads at most 72 bytes of a password, so longer ones are rejected instead of silently cut.
    password: str = Field(min_length=8, max_length=72)


class UserUpdateRequestSchema(CamelCaseModel):
    """Every field optional: PATCH changes only what the client sends. `password` sets a new one."""

    name: str | None = Field(default=None, min_length=1, max_length=80)
    role: UserRole | None = None
    is_active: bool | None = None
    password: str | None = Field(default=None, min_length=8, max_length=72)


class UserResponseSchema(CamelCaseResponseModel):
    id: int
    email: EmailStr
    name: str
    role: UserRole
    is_active: bool
    created_at: UtcDatetime

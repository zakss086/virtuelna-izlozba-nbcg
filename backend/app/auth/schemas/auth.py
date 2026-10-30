from __future__ import annotations

from datetime import datetime

from pydantic import BaseModel, EmailStr, Field

from app.users.models.user import UserRole
from app.users.schemas.user import UserResponseSchema
from app.utils.schemas import CamelCaseModel


class LoginRequestSchema(CamelCaseModel):
    email: EmailStr
    # bcrypt reads at most 72 bytes of a password, so longer ones are rejected instead of silently cut.
    password: str = Field(min_length=1, max_length=72)


class AuthenticationResponseSchema(CamelCaseModel):
    token: str
    user: UserResponseSchema


class CurrentUser(BaseModel):
    """The signed-in user as every endpoint sees it: taken from the token, checked against the database."""

    id: int
    email: str
    name: str
    role: UserRole
    is_active: bool = True
    created_at: datetime


class TokenPayload(BaseModel):
    sub: str
    exp: int
    iat: int

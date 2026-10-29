from __future__ import annotations

from pydantic import EmailStr

from app.users.models.user import UserRole
from app.utils.schemas import CamelCaseResponseModel, UtcDatetime


class UserResponseSchema(CamelCaseResponseModel):
    id: int
    email: EmailStr
    name: str
    role: UserRole
    created_at: UtcDatetime

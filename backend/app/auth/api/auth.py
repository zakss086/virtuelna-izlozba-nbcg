from __future__ import annotations

from typing import Annotated

from fastapi import Depends

from app.auth.schemas.auth import AuthenticationResponseSchema, CurrentUser, LoginRequestSchema
from app.auth.services.auth import IAuthService
from app.database.session_handler import DBAPIRouter
from app.deps import get_current_user, get_di_entity
from app.users.schemas.user import UserResponseSchema

router = DBAPIRouter()


@router.post(
    path="/sign-in",
    summary="Sign in",
    description="Returns a token for valid staff credentials. There is no sign-out call: the client drops the token.",
)
def sign_in(
    data: LoginRequestSchema,
    auth_service: Annotated[IAuthService, Depends(get_di_entity(IAuthService))],
) -> AuthenticationResponseSchema:
    return auth_service.login(data)


@router.get(path="/me", summary="Get signed-in user", description="The user behind the token.")
def get_signed_in_user(
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> UserResponseSchema:
    return UserResponseSchema.model_validate(current_user, from_attributes=True)

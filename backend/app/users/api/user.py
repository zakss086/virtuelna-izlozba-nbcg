from __future__ import annotations

from typing import Annotated

from fastapi import Depends, status

from app.auth.schemas.auth import CurrentUser
from app.database.session_handler import DBAPIRouter
from app.deps import get_current_user, get_di_entity
from app.users.schemas.user import (
    UserCreateRequestSchema,
    UserResponseSchema,
    UserUpdateRequestSchema,
)
from app.users.services.user import IUserService
from app.utils.pagination import Page, PaginationParams, get_pagination_params

router = DBAPIRouter(prefix="/users")


@router.get(path="", summary="List staff accounts (admin only)")
def get_users(
    user_service: Annotated[IUserService, Depends(get_di_entity(IUserService))],
    pagination_params: Annotated[PaginationParams, Depends(get_pagination_params)],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> Page[UserResponseSchema]:
    return user_service.list(pagination_params=pagination_params, current_user=current_user)


@router.post(
    path="",
    status_code=status.HTTP_201_CREATED,
    summary="Create a staff account (admin only)",
    description="The admin chooses the role and a first password and passes both to the person.",
)
def create_user(
    data: UserCreateRequestSchema,
    user_service: Annotated[IUserService, Depends(get_di_entity(IUserService))],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> UserResponseSchema:
    return user_service.create(data=data, current_user=current_user)


@router.patch(
    path="/{user_id}",
    summary="Change a staff account (admin only)",
    description=(
        "Name, role, `isActive` (a switched-off account cannot sign in and its token stops working at"
        " once) and a new `password`. An admin cannot change their own role or switch themselves off."
    ),
)
def update_user(
    user_id: int,
    data: UserUpdateRequestSchema,
    user_service: Annotated[IUserService, Depends(get_di_entity(IUserService))],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> UserResponseSchema:
    return user_service.update(user_id=user_id, data=data, current_user=current_user)

from __future__ import annotations

from typing import Annotated

from fastapi import Depends

from app.auth.schemas.auth import CurrentUser
from app.database.session_handler import DBAPIRouter
from app.deps import get_current_user, get_di_entity
from app.users.schemas.user import UserResponseSchema
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

from __future__ import annotations

from typing import Protocol

from app.auth.schemas.auth import CurrentUser
from app.users.exceptions.user import AdminOnlyException
from app.users.models.user import UserRole
from app.users.repositories.user import IUserRepository
from app.users.schemas.user import UserResponseSchema
from app.utils.di import inject
from app.utils.pagination import Page, PaginationParams


class IUserService(Protocol):
    def list(
        self, pagination_params: PaginationParams, current_user: CurrentUser
    ) -> Page[UserResponseSchema]: ...


@inject(alias=IUserService)
class UserService(IUserService):
    def __init__(self, user_repository: IUserRepository) -> None:
        self._user_repository = user_repository

    def list(
        self, pagination_params: PaginationParams, current_user: CurrentUser
    ) -> Page[UserResponseSchema]:
        if current_user.role != UserRole.ADMIN:
            raise AdminOnlyException
        users = self._user_repository.get_all(pagination_params=pagination_params)
        return Page(
            total=users.total,
            items=[UserResponseSchema.model_validate(user) for user in users.items],
            pages=users.pages,
        )

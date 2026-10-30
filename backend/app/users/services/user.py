from __future__ import annotations

from typing import Protocol

from sqlalchemy.exc import IntegrityError

from app.auth.password import hash_password
from app.auth.permissions import require_admin
from app.auth.schemas.auth import CurrentUser
from app.users.exceptions.user import (
    CannotChangeOwnAccessException,
    EmailAlreadyRegisteredException,
    UserNotFoundException,
)
from app.users.models.user import User
from app.users.repositories.user import IUserRepository
from app.users.schemas.user import (
    UserCreateRequestSchema,
    UserResponseSchema,
    UserUpdateRequestSchema,
)
from app.utils.di import inject
from app.utils.pagination import Page, PaginationParams


class IUserService(Protocol):
    def list(
        self, pagination_params: PaginationParams, current_user: CurrentUser
    ) -> Page[UserResponseSchema]: ...

    def create(
        self, data: UserCreateRequestSchema, current_user: CurrentUser
    ) -> UserResponseSchema: ...

    def update(
        self, user_id: int, data: UserUpdateRequestSchema, current_user: CurrentUser
    ) -> UserResponseSchema: ...


@inject(alias=IUserService)
class UserService(IUserService):
    def __init__(self, user_repository: IUserRepository) -> None:
        self._user_repository = user_repository

    def list(
        self, pagination_params: PaginationParams, current_user: CurrentUser
    ) -> Page[UserResponseSchema]:
        require_admin(current_user)
        users = self._user_repository.get_all(pagination_params=pagination_params)
        return Page(
            total=users.total,
            items=[UserResponseSchema.model_validate(user) for user in users.items],
            pages=users.pages,
        )

    def create(
        self, data: UserCreateRequestSchema, current_user: CurrentUser
    ) -> UserResponseSchema:
        require_admin(current_user)
        user = User(
            email=data.email.lower(),
            password_hash=hash_password(data.password),
            name=data.name,
            role=data.role,
        )
        try:
            saved = self._user_repository.add(user)
        except IntegrityError as e:
            # The UNIQUE constraint on users.email decides, not an `if` before the insert (ADR-007).
            raise EmailAlreadyRegisteredException from e
        return UserResponseSchema.model_validate(saved)

    def update(
        self, user_id: int, data: UserUpdateRequestSchema, current_user: CurrentUser
    ) -> UserResponseSchema:
        require_admin(current_user)
        user = self._user_repository.get_by_id(user_id)
        if user is None:
            raise UserNotFoundException

        changes = data.model_dump(exclude_unset=True)
        if user.id == current_user.id and (
            ("role" in changes and changes["role"] != user.role)
            or changes.get("is_active") is False
        ):
            raise CannotChangeOwnAccessException

        if changes.get("name") is not None:
            user.name = changes["name"]
        if changes.get("role") is not None:
            user.role = changes["role"]
        if changes.get("is_active") is not None:
            user.is_active = changes["is_active"]
        if changes.get("password") is not None:
            user.password_hash = hash_password(changes["password"])
        return UserResponseSchema.model_validate(self._user_repository.save(user))

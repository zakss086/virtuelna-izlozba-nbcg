from __future__ import annotations

from typing import Protocol

from sqlalchemy import select

from app.database.session_factory import ISessionFactory
from app.users.models.user import User
from app.utils.di import inject
from app.utils.pagination import Page, PaginationParams, paginate


class IUserRepository(Protocol):
    def get_all(self, pagination_params: PaginationParams) -> Page[User]: ...

    def get_by_id(self, user_id: int) -> User | None: ...

    def get_by_email(self, email: str) -> User | None: ...

    def add(self, user: User) -> User: ...

    def save(self, user: User) -> User: ...


@inject(alias=IUserRepository)
class UserRepository(IUserRepository):
    def __init__(self, session_factory: ISessionFactory) -> None:
        self._session_factory = session_factory

    def get_all(self, pagination_params: PaginationParams) -> Page[User]:
        db = self._session_factory()
        query = select(User).order_by(User.id)
        return paginate(query=query, pagination_params=pagination_params, db=db)

    def get_by_id(self, user_id: int) -> User | None:
        db = self._session_factory()
        return db.get(User, user_id)

    def get_by_email(self, email: str) -> User | None:
        db = self._session_factory()
        return db.scalar(select(User).where(User.email == email))

    def add(self, user: User) -> User:
        db = self._session_factory()
        db.add(user)
        db.flush()  # assigns id and created_at; the session handler commits (ADR-009)
        db.refresh(user)
        return user

    def save(self, user: User) -> User:
        db = self._session_factory()
        db.flush()
        db.refresh(user)
        return user

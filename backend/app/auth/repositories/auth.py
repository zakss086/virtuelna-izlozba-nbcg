from __future__ import annotations

from typing import Protocol

from sqlalchemy import select

from app.database.session_factory import ISessionFactory
from app.users.models.user import User
from app.utils.di import inject


class IAuthRepository(Protocol):
    def get_user_by_id(self, user_id: int) -> User | None: ...

    def get_user_by_email(self, email: str) -> User | None: ...


@inject(alias=IAuthRepository)
class AuthRepository(IAuthRepository):
    def __init__(self, session_factory: ISessionFactory) -> None:
        self._session_factory = session_factory

    def get_user_by_id(self, user_id: int) -> User | None:
        db = self._session_factory()
        return db.get(User, user_id)

    def get_user_by_email(self, email: str) -> User | None:
        db = self._session_factory()
        return db.scalar(select(User).where(User.email == email))

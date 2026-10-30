from __future__ import annotations

from typing import Protocol

from sqlalchemy import select

from app.database.session_factory import ISessionFactory
from app.libraries.models.library import Library, LibraryType
from app.utils.di import inject
from app.utils.pagination import Page, PaginationParams, paginate


class ILibraryRepository(Protocol):
    def get_all(
        self, library_type: LibraryType | None, city: str, pagination_params: PaginationParams
    ) -> Page[Library]: ...

    def get_by_id(self, library_id: int) -> Library | None: ...

    def add(self, library: Library) -> Library: ...

    def save(self, library: Library) -> Library: ...

    def delete(self, library: Library) -> None: ...


@inject(alias=ILibraryRepository)
class LibraryRepository(ILibraryRepository):
    def __init__(self, session_factory: ISessionFactory) -> None:
        self._session_factory = session_factory

    def get_all(
        self, library_type: LibraryType | None, city: str, pagination_params: PaginationParams
    ) -> Page[Library]:
        db = self._session_factory()
        query = select(Library).order_by(Library.name, Library.id)
        if library_type is not None:
            query = query.where(Library.type == library_type)
        if city:
            query = query.where(Library.city.ilike(city))  # a bound parameter, not SQL
        return paginate(query=query, pagination_params=pagination_params, db=db)

    def get_by_id(self, library_id: int) -> Library | None:
        db = self._session_factory()
        return db.get(Library, library_id)

    def add(self, library: Library) -> Library:
        db = self._session_factory()
        db.add(library)
        db.flush()  # assigns id; the endpoint's session handler commits (ADR-009)
        db.refresh(library)
        return library

    def save(self, library: Library) -> Library:
        db = self._session_factory()
        db.flush()
        db.refresh(library)
        return library

    def delete(self, library: Library) -> None:
        db = self._session_factory()
        db.delete(library)
        db.flush()

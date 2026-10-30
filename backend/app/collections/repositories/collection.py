from __future__ import annotations

from typing import Protocol

from sqlalchemy import select

from app.collections.models.collection import Collection
from app.database.session_factory import ISessionFactory
from app.utils.di import inject
from app.utils.pagination import Page, PaginationParams, paginate


class ICollectionRepository(Protocol):
    def get_all(self, pagination_params: PaginationParams) -> Page[Collection]: ...

    def get_by_id(self, collection_id: int) -> Collection | None: ...

    def add(self, collection: Collection) -> Collection: ...

    def save(self, collection: Collection) -> Collection: ...

    def delete(self, collection: Collection) -> None: ...


@inject(alias=ICollectionRepository)
class CollectionRepository(ICollectionRepository):
    def __init__(self, session_factory: ISessionFactory) -> None:
        self._session_factory = session_factory

    def get_all(self, pagination_params: PaginationParams) -> Page[Collection]:
        db = self._session_factory()
        query = select(Collection).order_by(Collection.position, Collection.id)
        return paginate(query=query, pagination_params=pagination_params, db=db)

    def get_by_id(self, collection_id: int) -> Collection | None:
        db = self._session_factory()
        return db.get(Collection, collection_id)

    def add(self, collection: Collection) -> Collection:
        db = self._session_factory()
        db.add(collection)
        db.flush()  # assigns id; the endpoint's session handler commits (ADR-009)
        db.refresh(collection)
        return collection

    def save(self, collection: Collection) -> Collection:
        db = self._session_factory()
        db.flush()
        db.refresh(collection)
        return collection

    def delete(self, collection: Collection) -> None:
        db = self._session_factory()
        db.delete(collection)
        db.flush()

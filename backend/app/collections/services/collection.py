from __future__ import annotations

from typing import Protocol

from app.auth.permissions import require_admin
from app.auth.schemas.auth import CurrentUser
from app.collections.exceptions.collection import CollectionNotFoundException
from app.collections.models.collection import Collection
from app.collections.repositories.collection import ICollectionRepository
from app.collections.schemas.collection import (
    CollectionCreateRequestSchema,
    CollectionResponseSchema,
    CollectionUpdateRequestSchema,
)
from app.utils.di import inject
from app.utils.pagination import Page, PaginationParams


class ICollectionService(Protocol):
    def list(self, pagination_params: PaginationParams) -> Page[CollectionResponseSchema]: ...

    def create(
        self, data: CollectionCreateRequestSchema, current_user: CurrentUser
    ) -> CollectionResponseSchema: ...

    def update(
        self, collection_id: int, data: CollectionUpdateRequestSchema, current_user: CurrentUser
    ) -> CollectionResponseSchema: ...

    def delete(self, collection_id: int, current_user: CurrentUser) -> None: ...


@inject(alias=ICollectionService)
class CollectionService(ICollectionService):
    def __init__(self, collection_repository: ICollectionRepository) -> None:
        self._collection_repository = collection_repository

    def list(self, pagination_params: PaginationParams) -> Page[CollectionResponseSchema]:
        collections = self._collection_repository.get_all(pagination_params=pagination_params)
        return Page(
            total=collections.total,
            items=[CollectionResponseSchema.model_validate(c) for c in collections.items],
            pages=collections.pages,
        )

    def create(
        self, data: CollectionCreateRequestSchema, current_user: CurrentUser
    ) -> CollectionResponseSchema:
        require_admin(current_user)
        collection = Collection(**data.model_dump(mode="json"))
        return CollectionResponseSchema.model_validate(self._collection_repository.add(collection))

    def update(
        self, collection_id: int, data: CollectionUpdateRequestSchema, current_user: CurrentUser
    ) -> CollectionResponseSchema:
        require_admin(current_user)
        collection = self._get_or_raise(collection_id)
        for name, value in data.model_dump(exclude_unset=True, mode="json").items():
            if value is not None:  # none of the fields can be cleared
                setattr(collection, name, value)
        return CollectionResponseSchema.model_validate(self._collection_repository.save(collection))

    def delete(self, collection_id: int, current_user: CurrentUser) -> None:
        require_admin(current_user)
        self._collection_repository.delete(self._get_or_raise(collection_id))

    def _get_or_raise(self, collection_id: int) -> Collection:
        collection = self._collection_repository.get_by_id(collection_id)
        if collection is None:
            raise CollectionNotFoundException
        return collection

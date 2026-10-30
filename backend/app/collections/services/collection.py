from __future__ import annotations

from typing import Protocol

from app.audit.models.audit import AuditAction, AuditEntityType
from app.audit.services.audit import IAuditService
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
    def __init__(
        self, collection_repository: ICollectionRepository, audit_service: IAuditService
    ) -> None:
        self._collection_repository = collection_repository
        self._audit_service = audit_service

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
        saved = self._collection_repository.add(collection)
        self._record(current_user, AuditAction.CREATE, saved)
        return CollectionResponseSchema.model_validate(saved)

    def update(
        self, collection_id: int, data: CollectionUpdateRequestSchema, current_user: CurrentUser
    ) -> CollectionResponseSchema:
        require_admin(current_user)
        collection = self._get_or_raise(collection_id)
        for name, value in data.model_dump(exclude_unset=True, mode="json").items():
            if value is not None:  # none of the fields can be cleared
                setattr(collection, name, value)
        saved = self._collection_repository.save(collection)
        self._record(
            current_user, AuditAction.UPDATE, saved, ", ".join(sorted(data.model_fields_set))
        )
        return CollectionResponseSchema.model_validate(saved)

    def delete(self, collection_id: int, current_user: CurrentUser) -> None:
        require_admin(current_user)
        collection = self._get_or_raise(collection_id)
        self._collection_repository.delete(collection)
        self._record(current_user, AuditAction.DELETE, collection)

    def _record(
        self,
        current_user: CurrentUser,
        action: AuditAction,
        collection: Collection,
        detail: str | None = None,
    ) -> None:
        self._audit_service.record(
            current_user=current_user,
            action=action,
            entity_type=AuditEntityType.COLLECTION,
            entity_ref=collection.id,
            label=collection.name["me"],
            detail=detail,
        )

    def _get_or_raise(self, collection_id: int) -> Collection:
        collection = self._collection_repository.get_by_id(collection_id)
        if collection is None:
            raise CollectionNotFoundException
        return collection

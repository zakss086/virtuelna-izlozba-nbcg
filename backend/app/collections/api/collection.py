from __future__ import annotations

from typing import Annotated

from fastapi import Depends, status

from app.auth.schemas.auth import CurrentUser
from app.collections.schemas.collection import (
    CollectionCreateRequestSchema,
    CollectionResponseSchema,
    CollectionUpdateRequestSchema,
)
from app.collections.services.collection import ICollectionService
from app.database.session_handler import DBAPIRouter
from app.deps import get_current_user, get_di_entity
from app.utils.pagination import Page, PaginationParams, get_pagination_params

router = DBAPIRouter(prefix="/collections")


@router.get(
    path="", summary="List collections", description="Public, in the order set by `position`."
)
def get_collections(
    collection_service: Annotated[ICollectionService, Depends(get_di_entity(ICollectionService))],
    pagination_params: Annotated[PaginationParams, Depends(get_pagination_params)],
) -> Page[CollectionResponseSchema]:
    return collection_service.list(pagination_params=pagination_params)


@router.post(path="", status_code=status.HTTP_201_CREATED, summary="Create collection (admin only)")
def create_collection(
    data: CollectionCreateRequestSchema,
    collection_service: Annotated[ICollectionService, Depends(get_di_entity(ICollectionService))],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> CollectionResponseSchema:
    return collection_service.create(data=data, current_user=current_user)


@router.patch(path="/{collection_id}", summary="Update collection (admin only)")
def update_collection(
    collection_id: int,
    data: CollectionUpdateRequestSchema,
    collection_service: Annotated[ICollectionService, Depends(get_di_entity(ICollectionService))],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> CollectionResponseSchema:
    return collection_service.update(
        collection_id=collection_id, data=data, current_user=current_user
    )


@router.delete(
    path="/{collection_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
    summary="Delete collection (admin only)",
)
def delete_collection(
    collection_id: int,
    collection_service: Annotated[ICollectionService, Depends(get_di_entity(ICollectionService))],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> None:
    collection_service.delete(collection_id=collection_id, current_user=current_user)

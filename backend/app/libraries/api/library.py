from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Query, status

from app.auth.schemas.auth import CurrentUser
from app.database.session_handler import DBAPIRouter
from app.deps import get_current_user, get_di_entity
from app.libraries.models.library import LibraryType
from app.libraries.schemas.library import (
    LibraryCreateRequestSchema,
    LibraryResponseSchema,
    LibraryUpdateRequestSchema,
)
from app.libraries.services.library import ILibraryService
from app.utils.pagination import Page, PaginationParams, get_pagination_params

router = DBAPIRouter(prefix="/libraries")


@router.get(
    path="",
    summary="List libraries",
    description="Public, by name. `type` and `city` (case-insensitive, exact) filter the list.",
)
def get_libraries(
    library_service: Annotated[ILibraryService, Depends(get_di_entity(ILibraryService))],
    pagination_params: Annotated[PaginationParams, Depends(get_pagination_params)],
    library_type: Annotated[LibraryType | None, Query(alias="type")] = None,
    city: Annotated[str, Query(max_length=100)] = "",
) -> Page[LibraryResponseSchema]:
    return library_service.list(
        library_type=library_type, city=city, pagination_params=pagination_params
    )


@router.get(path="/{library_id}", summary="Get library")
def get_library(
    library_id: int,
    library_service: Annotated[ILibraryService, Depends(get_di_entity(ILibraryService))],
) -> LibraryResponseSchema:
    return library_service.get(library_id=library_id)


@router.post(path="", status_code=status.HTTP_201_CREATED, summary="Create library (admin only)")
def create_library(
    data: LibraryCreateRequestSchema,
    library_service: Annotated[ILibraryService, Depends(get_di_entity(ILibraryService))],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> LibraryResponseSchema:
    return library_service.create(data=data, current_user=current_user)


@router.patch(path="/{library_id}", summary="Update library (admin only)")
def update_library(
    library_id: int,
    data: LibraryUpdateRequestSchema,
    library_service: Annotated[ILibraryService, Depends(get_di_entity(ILibraryService))],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> LibraryResponseSchema:
    return library_service.update(library_id=library_id, data=data, current_user=current_user)


@router.delete(
    path="/{library_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
    summary="Delete library (admin only)",
)
def delete_library(
    library_id: int,
    library_service: Annotated[ILibraryService, Depends(get_di_entity(ILibraryService))],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> None:
    library_service.delete(library_id=library_id, current_user=current_user)

from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Query, status

from app.auth.schemas.auth import CurrentUser
from app.database.session_handler import DBAPIRouter
from app.deps import get_current_user, get_di_entity, get_optional_user
from app.exhibitions.models.exhibition import ExhibitionStatus, ExhibitionTemplate
from app.exhibitions.schemas.exhibition import (
    ExhibitionCreateRequestSchema,
    ExhibitionResponseSchema,
    ExhibitionUpdateRequestSchema,
    StatusRequestSchema,
)
from app.exhibitions.services.exhibition import IExhibitionService
from app.utils.pagination import Page, PaginationParams, get_pagination_params

router = DBAPIRouter(prefix="/exhibitions")


@router.get(
    path="",
    summary="List exhibitions",
    description=(
        "Newest first. An anonymous visitor sees only published exhibitions; a curator also sees"
        " their own; an admin sees all. `search` matches title, summary and tags; `ids` is a"
        " comma-separated list."
    ),
)
def get_exhibitions(
    exhibition_service: Annotated[IExhibitionService, Depends(get_di_entity(IExhibitionService))],
    pagination_params: Annotated[PaginationParams, Depends(get_pagination_params)],
    current_user: Annotated[CurrentUser | None, Depends(get_optional_user)],
    search: Annotated[str, Query(max_length=80)] = "",
    template: ExhibitionTemplate | None = None,
    exhibition_status: Annotated[ExhibitionStatus | None, Query(alias="status")] = None,
    author_id: Annotated[int | None, Query(alias="authorId")] = None,
    ids: Annotated[str, Query(max_length=200, pattern=r"^[0-9,]*$")] = "",
) -> Page[ExhibitionResponseSchema]:
    return exhibition_service.list(
        current_user=current_user,
        search=search,
        template=template,
        status=exhibition_status,
        author_id=author_id,
        ids=[int(part) for part in ids.split(",") if part],
        pagination_params=pagination_params,
    )


@router.get(path="/{slug_or_id}", summary="Get exhibition by slug or id")
def get_exhibition(
    slug_or_id: str,
    exhibition_service: Annotated[IExhibitionService, Depends(get_di_entity(IExhibitionService))],
    current_user: Annotated[CurrentUser | None, Depends(get_optional_user)],
) -> ExhibitionResponseSchema:
    return exhibition_service.get(slug_or_id=slug_or_id, current_user=current_user)


@router.post(path="", status_code=status.HTTP_201_CREATED, summary="Create exhibition")
def create_exhibition(
    data: ExhibitionCreateRequestSchema,
    exhibition_service: Annotated[IExhibitionService, Depends(get_di_entity(IExhibitionService))],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> ExhibitionResponseSchema:
    return exhibition_service.create(data=data, current_user=current_user)


@router.patch(path="/{exhibition_id}", summary="Update exhibition (author or admin)")
def update_exhibition(
    exhibition_id: int,
    data: ExhibitionUpdateRequestSchema,
    exhibition_service: Annotated[IExhibitionService, Depends(get_di_entity(IExhibitionService))],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> ExhibitionResponseSchema:
    return exhibition_service.update(
        exhibition_id=exhibition_id, data=data, current_user=current_user
    )


@router.patch(
    path="/{exhibition_id}/status",
    summary="Change status",
    description="An author moves draft and pending; an admin publishes or returns to draft.",
)
def set_exhibition_status(
    exhibition_id: int,
    data: StatusRequestSchema,
    exhibition_service: Annotated[IExhibitionService, Depends(get_di_entity(IExhibitionService))],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> ExhibitionResponseSchema:
    return exhibition_service.set_status(
        exhibition_id=exhibition_id, status=data.status, current_user=current_user
    )


@router.delete(
    path="/{exhibition_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
    summary="Delete exhibition (author or admin)",
)
def delete_exhibition(
    exhibition_id: int,
    exhibition_service: Annotated[IExhibitionService, Depends(get_di_entity(IExhibitionService))],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> None:
    exhibition_service.delete(exhibition_id=exhibition_id, current_user=current_user)

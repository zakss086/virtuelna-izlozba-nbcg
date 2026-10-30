from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Path, status

from app.auth.schemas.auth import CurrentUser
from app.content.schemas.content import (
    KEY_PATTERN,
    ContentBlockResponseSchema,
    ContentBlockUpdateRequestSchema,
)
from app.content.services.content import IContentService
from app.database.session_handler import DBAPIRouter
from app.deps import get_current_user, get_di_entity
from app.utils.pagination import Page, PaginationParams, get_pagination_params

router = DBAPIRouter(prefix="/content")

KeyPath = Annotated[str, Path(max_length=80, pattern=KEY_PATTERN, description="Message key")]


@router.get(
    path="",
    summary="List edited site texts",
    description="Public: the frontend applies these over its default texts.",
)
def get_content_blocks(
    content_service: Annotated[IContentService, Depends(get_di_entity(IContentService))],
    pagination_params: Annotated[PaginationParams, Depends(get_pagination_params)],
) -> Page[ContentBlockResponseSchema]:
    return content_service.list(pagination_params=pagination_params)


@router.put(path="/{key}", summary="Set a site text in both languages (admin only)")
def save_content_block(
    key: KeyPath,
    data: ContentBlockUpdateRequestSchema,
    content_service: Annotated[IContentService, Depends(get_di_entity(IContentService))],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> ContentBlockResponseSchema:
    return content_service.save(key=key, data=data, current_user=current_user)


@router.delete(
    path="/{key}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
    summary="Bring back the default text (admin only)",
)
def reset_content_block(
    key: KeyPath,
    content_service: Annotated[IContentService, Depends(get_di_entity(IContentService))],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> None:
    content_service.reset(key=key, current_user=current_user)

from __future__ import annotations

from typing import Protocol

from sqlalchemy.exc import IntegrityError

from app.audit.models.audit import AuditAction, AuditEntityType
from app.audit.services.audit import IAuditService
from app.auth.permissions import require_admin
from app.auth.schemas.auth import CurrentUser
from app.content.exceptions.content import (
    ContentBlockConflictException,
    ContentBlockNotFoundException,
)
from app.content.models.content import ContentBlock
from app.content.repositories.content import IContentRepository
from app.content.schemas.content import ContentBlockResponseSchema, ContentBlockUpdateRequestSchema
from app.utils.di import inject
from app.utils.pagination import Page, PaginationParams


class IContentService(Protocol):
    def list(self, pagination_params: PaginationParams) -> Page[ContentBlockResponseSchema]: ...

    def save(
        self, key: str, data: ContentBlockUpdateRequestSchema, current_user: CurrentUser
    ) -> ContentBlockResponseSchema: ...

    def reset(self, key: str, current_user: CurrentUser) -> None: ...


@inject(alias=IContentService)
class ContentService(IContentService):
    def __init__(
        self, content_repository: IContentRepository, audit_service: IAuditService
    ) -> None:
        self._content_repository = content_repository
        self._audit_service = audit_service

    def list(self, pagination_params: PaginationParams) -> Page[ContentBlockResponseSchema]:
        blocks = self._content_repository.get_all(pagination_params=pagination_params)
        return Page(
            total=blocks.total,
            items=[ContentBlockResponseSchema.model_validate(block) for block in blocks.items],
            pages=blocks.pages,
        )

    def save(
        self, key: str, data: ContentBlockUpdateRequestSchema, current_user: CurrentUser
    ) -> ContentBlockResponseSchema:
        require_admin(current_user)
        existing = self._content_repository.get_by_key(key)
        block = existing or ContentBlock(key=key)
        block.value = data.value.model_dump()
        # The editor is always the signed-in admin, never an id from the request body (ADR-006).
        block.updated_by_id = current_user.id
        try:
            saved = self._content_repository.save(block)
        except IntegrityError as e:
            # Two admins created the same new key at once: the UNIQUE constraint on `key` decides (ADR-007).
            raise ContentBlockConflictException from e
        self._audit_service.record(
            current_user=current_user,
            action=AuditAction.UPDATE if existing else AuditAction.CREATE,
            entity_type=AuditEntityType.CONTENT,
            entity_ref=key,
            label=key,
        )
        return ContentBlockResponseSchema.model_validate(saved)

    def reset(self, key: str, current_user: CurrentUser) -> None:
        require_admin(current_user)
        block = self._content_repository.get_by_key(key)
        if block is None:
            raise ContentBlockNotFoundException
        self._content_repository.delete(block)
        self._audit_service.record(
            current_user=current_user,
            action=AuditAction.DELETE,
            entity_type=AuditEntityType.CONTENT,
            entity_ref=key,
            label=key,
            detail="default_restored",
        )

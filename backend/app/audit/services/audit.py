from __future__ import annotations

from typing import Protocol

from app.audit.models.audit import AuditAction, AuditEntityType, AuditEntry
from app.audit.repositories.audit import IAuditRepository
from app.audit.schemas.audit import AuditEntryResponseSchema
from app.auth.permissions import require_admin
from app.auth.schemas.auth import CurrentUser
from app.utils.di import inject
from app.utils.pagination import Page, PaginationParams

_MAX_LABEL = 200
_MAX_DETAIL = 1000


class IAuditService(Protocol):
    def list(
        self,
        entity_type: AuditEntityType | None,
        pagination_params: PaginationParams,
        current_user: CurrentUser,
    ) -> Page[AuditEntryResponseSchema]: ...

    def record(
        self,
        current_user: CurrentUser,
        action: AuditAction,
        entity_type: AuditEntityType,
        entity_ref: str | int,
        label: str,
        detail: str | None = None,
    ) -> None: ...


@inject(alias=IAuditService)
class AuditService(IAuditService):
    def __init__(self, audit_repository: IAuditRepository) -> None:
        self._audit_repository = audit_repository

    def list(
        self,
        entity_type: AuditEntityType | None,
        pagination_params: PaginationParams,
        current_user: CurrentUser,
    ) -> Page[AuditEntryResponseSchema]:
        require_admin(current_user)
        entries = self._audit_repository.get_all(
            entity_type=entity_type, pagination_params=pagination_params
        )
        return Page(
            total=entries.total,
            items=[AuditEntryResponseSchema.model_validate(entry) for entry in entries.items],
            pages=entries.pages,
        )

    def record(
        self,
        current_user: CurrentUser,
        action: AuditAction,
        entity_type: AuditEntityType,
        entity_ref: str | int,
        label: str,
        detail: str | None = None,
    ) -> None:
        # Called by the other services inside their own transaction: the entry commits or rolls back with the change.
        self._audit_repository.add(
            AuditEntry(
                actor_id=current_user.id,
                actor_name=current_user.name,
                action=action,
                entity_type=entity_type,
                entity_ref=str(entity_ref),
                label=label[:_MAX_LABEL],
                detail=detail[:_MAX_DETAIL] if detail else None,
            )
        )

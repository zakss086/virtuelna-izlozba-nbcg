from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Query

from app.audit.models.audit import AuditEntityType
from app.audit.schemas.audit import AuditEntryResponseSchema
from app.audit.services.audit import IAuditService
from app.auth.schemas.auth import CurrentUser
from app.database.session_handler import DBAPIRouter
from app.deps import get_current_user, get_di_entity
from app.utils.pagination import Page, PaginationParams, get_pagination_params

router = DBAPIRouter(prefix="/audit")


@router.get(
    path="",
    summary="History of changes (admin only)",
    description="Who changed what and when, newest first. `entityType` narrows the list to one kind of record.",
)
def get_audit_entries(
    audit_service: Annotated[IAuditService, Depends(get_di_entity(IAuditService))],
    pagination_params: Annotated[PaginationParams, Depends(get_pagination_params)],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    entity_type: Annotated[
        AuditEntityType | None, Query(alias="entityType", description="Kind of record")
    ] = None,
) -> Page[AuditEntryResponseSchema]:
    return audit_service.list(
        entity_type=entity_type, pagination_params=pagination_params, current_user=current_user
    )

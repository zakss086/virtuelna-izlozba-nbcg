from __future__ import annotations

from app.audit.models.audit import AuditAction, AuditEntityType
from app.utils.schemas import CamelCaseResponseModel, UtcDatetime


class AuditEntryResponseSchema(CamelCaseResponseModel):
    id: int
    created_at: UtcDatetime
    actor_id: int | None
    actor_name: str
    action: AuditAction
    entity_type: AuditEntityType
    entity_ref: str
    label: str
    detail: str | None

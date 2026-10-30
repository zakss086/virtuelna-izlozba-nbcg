from __future__ import annotations

from typing import Protocol

from sqlalchemy import select

from app.audit.models.audit import AuditEntityType, AuditEntry
from app.database.session_factory import ISessionFactory
from app.utils.di import inject
from app.utils.pagination import Page, PaginationParams, paginate


class IAuditRepository(Protocol):
    def get_all(
        self, entity_type: AuditEntityType | None, pagination_params: PaginationParams
    ) -> Page[AuditEntry]: ...

    def add(self, entry: AuditEntry) -> AuditEntry: ...


@inject(alias=IAuditRepository)
class AuditRepository(IAuditRepository):
    def __init__(self, session_factory: ISessionFactory) -> None:
        self._session_factory = session_factory

    def get_all(
        self, entity_type: AuditEntityType | None, pagination_params: PaginationParams
    ) -> Page[AuditEntry]:
        db = self._session_factory()
        query = select(AuditEntry).order_by(AuditEntry.created_at.desc(), AuditEntry.id.desc())
        if entity_type is not None:
            query = query.where(AuditEntry.entity_type == entity_type)
        return paginate(query=query, pagination_params=pagination_params, db=db)

    def add(self, entry: AuditEntry) -> AuditEntry:
        db = self._session_factory()
        db.add(entry)
        db.flush()  # in the same transaction as the change it describes; the endpoint's session handler commits
        return entry

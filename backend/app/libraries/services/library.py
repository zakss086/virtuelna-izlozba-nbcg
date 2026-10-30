from __future__ import annotations

from typing import Any, Protocol

from app.audit.models.audit import AuditAction, AuditEntityType
from app.audit.services.audit import IAuditService
from app.auth.permissions import require_admin
from app.auth.schemas.auth import CurrentUser
from app.libraries.exceptions.library import LibraryNotFoundException
from app.libraries.models.library import Library, LibraryType
from app.libraries.repositories.library import ILibraryRepository
from app.libraries.schemas.library import (
    LibraryCreateRequestSchema,
    LibraryResponseSchema,
    LibraryUpdateRequestSchema,
)
from app.utils.di import inject
from app.utils.pagination import Page, PaginationParams


class ILibraryService(Protocol):
    def list(
        self, library_type: LibraryType | None, city: str, pagination_params: PaginationParams
    ) -> Page[LibraryResponseSchema]: ...

    def get(self, library_id: int) -> LibraryResponseSchema: ...

    def create(
        self, data: LibraryCreateRequestSchema, current_user: CurrentUser
    ) -> LibraryResponseSchema: ...

    def update(
        self, library_id: int, data: LibraryUpdateRequestSchema, current_user: CurrentUser
    ) -> LibraryResponseSchema: ...

    def delete(self, library_id: int, current_user: CurrentUser) -> None: ...


def library_columns(
    data: LibraryCreateRequestSchema | LibraryUpdateRequestSchema,
) -> dict[str, Any]:
    """The schema as column values: nested objects become JSON, the position becomes three columns."""
    values = data.model_dump(exclude_unset=True, mode="json")
    if "location" in values:
        location = values.pop("location") or {}
        values["lat"] = location.get("lat")
        values["lng"] = location.get("lng")
        values["precision"] = location.get("precision")
    if "image" in values and values["image"] is not None:
        values["image"] = {
            "url": values["image"]["url"],
            "credit": values["image"]["credit"],
            "license": values["image"]["license"],
            "sourceUrl": values["image"]["source_url"],
        }
    return values


@inject(alias=ILibraryService)
class LibraryService(ILibraryService):
    def __init__(
        self, library_repository: ILibraryRepository, audit_service: IAuditService
    ) -> None:
        self._library_repository = library_repository
        self._audit_service = audit_service

    def list(
        self, library_type: LibraryType | None, city: str, pagination_params: PaginationParams
    ) -> Page[LibraryResponseSchema]:
        libraries = self._library_repository.get_all(
            library_type=library_type, city=city.strip(), pagination_params=pagination_params
        )
        return Page(
            total=libraries.total,
            items=[LibraryResponseSchema.model_validate(library) for library in libraries.items],
            pages=libraries.pages,
        )

    def get(self, library_id: int) -> LibraryResponseSchema:
        return LibraryResponseSchema.model_validate(self._get_or_raise(library_id))

    def create(
        self, data: LibraryCreateRequestSchema, current_user: CurrentUser
    ) -> LibraryResponseSchema:
        require_admin(current_user)
        library = Library(**library_columns(data))
        saved = self._library_repository.add(library)
        self._record(current_user, AuditAction.CREATE, saved)
        return LibraryResponseSchema.model_validate(saved)

    def update(
        self, library_id: int, data: LibraryUpdateRequestSchema, current_user: CurrentUser
    ) -> LibraryResponseSchema:
        require_admin(current_user)
        library = self._get_or_raise(library_id)
        for name, value in library_columns(data).items():
            if value is None and name in {"name", "type", "city"}:
                continue  # these three cannot be cleared
            setattr(library, name, value)
        saved = self._library_repository.save(library)
        self._record(
            current_user, AuditAction.UPDATE, saved, ", ".join(sorted(data.model_fields_set))
        )
        return LibraryResponseSchema.model_validate(saved)

    def delete(self, library_id: int, current_user: CurrentUser) -> None:
        require_admin(current_user)
        library = self._get_or_raise(library_id)
        self._library_repository.delete(library)
        self._record(current_user, AuditAction.DELETE, library)

    def _record(
        self,
        current_user: CurrentUser,
        action: AuditAction,
        library: Library,
        detail: str | None = None,
    ) -> None:
        self._audit_service.record(
            current_user=current_user,
            action=action,
            entity_type=AuditEntityType.LIBRARY,
            entity_ref=library.id,
            label=library.name,
            detail=detail,
        )

    def _get_or_raise(self, library_id: int) -> Library:
        library = self._library_repository.get_by_id(library_id)
        if library is None:
            raise LibraryNotFoundException
        return library

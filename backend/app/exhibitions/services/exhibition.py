from __future__ import annotations

from typing import Protocol

from sqlalchemy.exc import IntegrityError

from app.audit.models.audit import AuditAction, AuditEntityType
from app.audit.services.audit import IAuditService
from app.auth.schemas.auth import CurrentUser
from app.exhibitions.exceptions.exhibition import (
    ExhibitionNotFoundException,
    NotExhibitionAuthorException,
    SlugTakenException,
    StatusChangeNotAllowedException,
)
from app.exhibitions.models.exhibition import (
    Exhibition,
    ExhibitionItem,
    ExhibitionStatus,
    ExhibitionTemplate,
    ExhibitionVideo,
    Section,
)
from app.exhibitions.repositories.exhibition import ExhibitionFilters, IExhibitionRepository
from app.exhibitions.schemas.exhibition import (
    ExhibitionCreateRequestSchema,
    ExhibitionResponseSchema,
    ExhibitionUpdateRequestSchema,
    SectionRequestSchema,
    VideoRequestSchema,
)
from app.users.models.user import UserRole
from app.utils.di import inject
from app.utils.pagination import Page, PaginationParams
from app.utils.slug import slugify

# An author moves an exhibition between these two; only an admin publishes or unpublishes (ADR-006).
_AUTHOR_STATUSES = {ExhibitionStatus.DRAFT, ExhibitionStatus.PENDING}


class IExhibitionService(Protocol):
    def list(
        self,
        current_user: CurrentUser | None,
        search: str,
        template: ExhibitionTemplate | None,
        status: ExhibitionStatus | None,
        author_id: int | None,
        ids: list[int],
        pagination_params: PaginationParams,
    ) -> Page[ExhibitionResponseSchema]: ...

    def get(
        self, slug_or_id: str, current_user: CurrentUser | None
    ) -> ExhibitionResponseSchema: ...

    def create(
        self, data: ExhibitionCreateRequestSchema, current_user: CurrentUser
    ) -> ExhibitionResponseSchema: ...

    def update(
        self, exhibition_id: int, data: ExhibitionUpdateRequestSchema, current_user: CurrentUser
    ) -> ExhibitionResponseSchema: ...

    def set_status(
        self, exhibition_id: int, status: ExhibitionStatus, current_user: CurrentUser
    ) -> ExhibitionResponseSchema: ...

    def delete(self, exhibition_id: int, current_user: CurrentUser) -> None: ...


def _is_admin(user: CurrentUser | None) -> bool:
    return user is not None and user.role == UserRole.ADMIN


def _build_sections(data: list[SectionRequestSchema]) -> list[Section]:
    return [
        Section(
            position=section_index,
            title=section.title.model_dump(),
            text=section.text.model_dump(),
            year=section.year,
            place=section.place.model_dump() if section.place else None,
            items=[
                ExhibitionItem(
                    position=item_index,
                    **item.model_dump(exclude={"title"}),
                    title=item.title.model_dump(),
                )
                for item_index, item in enumerate(section.items)
            ],
        )
        for section_index, section in enumerate(data)
    ]


def _build_videos(data: list[VideoRequestSchema]) -> list[ExhibitionVideo]:
    return [
        ExhibitionVideo(
            position=index,
            title=video.title.model_dump(),
            description=video.description.model_dump(),
            src=video.src,
            credit=video.credit,
            license=video.license,
            source_url=video.source_url,
        )
        for index, video in enumerate(data)
    ]


def build_exhibition(data: ExhibitionCreateRequestSchema, author_id: int, slug: str) -> Exhibition:
    return Exhibition(
        slug=slug,
        title=data.title.model_dump(),
        summary=data.summary.model_dump(),
        intro=data.intro.model_dump() if data.intro else None,
        cover_url=data.cover_url,
        template=data.template,
        status=data.status,
        period=data.period,
        tags=data.tags,
        author_id=author_id,
        sections=_build_sections(data.sections),
        videos=_build_videos(data.videos),
    )


@inject(alias=IExhibitionService)
class ExhibitionService(IExhibitionService):
    def __init__(
        self, exhibition_repository: IExhibitionRepository, audit_service: IAuditService
    ) -> None:
        self._exhibition_repository = exhibition_repository
        self._audit_service = audit_service

    def list(
        self,
        current_user: CurrentUser | None,
        search: str,
        template: ExhibitionTemplate | None,
        status: ExhibitionStatus | None,
        author_id: int | None,
        ids: list[int],
        pagination_params: PaginationParams,
    ) -> Page[ExhibitionResponseSchema]:
        filters = ExhibitionFilters(
            viewer_id=current_user.id if current_user else None,
            viewer_sees_all=_is_admin(current_user),
            search=search.strip(),
            template=template,
            status=status,
            author_id=author_id,
            ids=ids,
        )
        exhibitions = self._exhibition_repository.get_all(
            filters=filters, pagination_params=pagination_params
        )
        return Page(
            total=exhibitions.total,
            items=[ExhibitionResponseSchema.model_validate(e) for e in exhibitions.items],
            pages=exhibitions.pages,
        )

    def get(self, slug_or_id: str, current_user: CurrentUser | None) -> ExhibitionResponseSchema:
        exhibition = (
            self._exhibition_repository.get_by_id(int(slug_or_id))
            if slug_or_id.isdigit()
            else self._exhibition_repository.get_by_slug(slug_or_id)
        )
        # An exhibition the caller may not see does not exist for them: 404, not 403.
        if exhibition is None or not self._can_see(exhibition, current_user):
            raise ExhibitionNotFoundException
        return ExhibitionResponseSchema.model_validate(exhibition)

    def create(
        self, data: ExhibitionCreateRequestSchema, current_user: CurrentUser
    ) -> ExhibitionResponseSchema:
        self._check_status(current_user=current_user, current=None, wanted=data.status)
        # The author is always the signed-in user, never an id from the request body (ADR-006).
        exhibition = build_exhibition(
            data=data, author_id=current_user.id, slug=self._unique_slug(data.title.me)
        )
        try:
            saved = self._exhibition_repository.add(exhibition)
        except IntegrityError as e:
            raise SlugTakenException from e
        self._record(current_user, AuditAction.CREATE, saved, f"status={saved.status}")
        return ExhibitionResponseSchema.model_validate(saved)

    def update(
        self, exhibition_id: int, data: ExhibitionUpdateRequestSchema, current_user: CurrentUser
    ) -> ExhibitionResponseSchema:
        exhibition = self._get_editable(exhibition_id, current_user)
        changes = data.model_dump(exclude_unset=True)
        old_status = exhibition.status

        if data.status is not None:
            self._check_status(
                current_user=current_user,
                current=ExhibitionStatus(exhibition.status),
                wanted=data.status,
            )
            exhibition.status = data.status
        for name in ("cover_url", "template", "period", "tags"):
            if name in changes and changes[name] is not None:
                setattr(exhibition, name, changes[name])
        for name in ("title", "summary"):
            value = getattr(data, name)
            if value is not None:
                setattr(exhibition, name, value.model_dump())
        if "intro" in changes:
            exhibition.intro = data.intro.model_dump() if data.intro else None
        if data.sections is not None:
            exhibition.sections = _build_sections(data.sections)
        if data.videos is not None:
            exhibition.videos = _build_videos(data.videos)

        saved = self._exhibition_repository.save(exhibition)
        notes = sorted(data.model_fields_set - {"status"})
        if saved.status != old_status:
            notes.append(f"status={old_status}>{saved.status}")
        self._record(current_user, AuditAction.UPDATE, saved, ", ".join(notes))
        return ExhibitionResponseSchema.model_validate(saved)

    def set_status(
        self, exhibition_id: int, status: ExhibitionStatus, current_user: CurrentUser
    ) -> ExhibitionResponseSchema:
        exhibition = self._get_editable(exhibition_id, current_user)
        self._check_status(
            current_user=current_user, current=ExhibitionStatus(exhibition.status), wanted=status
        )
        old_status = exhibition.status
        exhibition.status = status
        saved = self._exhibition_repository.save(exhibition)
        if saved.status != old_status:
            self._record(
                current_user, AuditAction.UPDATE, saved, f"status={old_status}>{saved.status}"
            )
        return ExhibitionResponseSchema.model_validate(saved)

    def delete(self, exhibition_id: int, current_user: CurrentUser) -> None:
        exhibition = self._get_editable(exhibition_id, current_user)
        self._record(current_user, AuditAction.DELETE, exhibition)
        self._exhibition_repository.delete(exhibition)

    def _record(
        self,
        current_user: CurrentUser,
        action: AuditAction,
        exhibition: Exhibition,
        detail: str | None = None,
    ) -> None:
        self._audit_service.record(
            current_user=current_user,
            action=action,
            entity_type=AuditEntityType.EXHIBITION,
            entity_ref=exhibition.id,
            label=exhibition.title["me"],
            detail=detail,
        )

    def _get_editable(self, exhibition_id: int, current_user: CurrentUser) -> Exhibition:
        exhibition = self._exhibition_repository.get_by_id(exhibition_id)
        if exhibition is None or not self._can_see(exhibition, current_user):
            raise ExhibitionNotFoundException
        if exhibition.author_id != current_user.id and not _is_admin(current_user):
            raise NotExhibitionAuthorException
        return exhibition

    @staticmethod
    def _can_see(exhibition: Exhibition, current_user: CurrentUser | None) -> bool:
        if exhibition.status == ExhibitionStatus.PUBLISHED or _is_admin(current_user):
            return True
        return current_user is not None and exhibition.author_id == current_user.id

    @staticmethod
    def _check_status(
        current_user: CurrentUser, current: ExhibitionStatus | None, wanted: ExhibitionStatus
    ) -> None:
        if wanted == current or _is_admin(current_user):
            return
        # An author can only move between draft and pending, and cannot touch a published one's status.
        if wanted not in _AUTHOR_STATUSES or current == ExhibitionStatus.PUBLISHED:
            raise StatusChangeNotAllowedException

    def _unique_slug(self, title: str) -> str:
        base = slugify(title)
        slug = base
        suffix = 2
        while self._exhibition_repository.slug_exists(slug):
            slug = f"{base}-{suffix}"
            suffix += 1
        return slug

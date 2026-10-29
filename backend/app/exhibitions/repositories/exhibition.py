from __future__ import annotations

from dataclasses import dataclass, field
from typing import Protocol

from sqlalchemy import String, cast, func, or_, select
from sqlalchemy.orm import selectinload

from app.database.session_factory import ISessionFactory
from app.exhibitions.models.exhibition import (
    Exhibition,
    ExhibitionStatus,
    ExhibitionTemplate,
    Section,
)
from app.utils.di import inject
from app.utils.pagination import Page, PaginationParams, paginate


@dataclass
class ExhibitionFilters:
    """What the caller asked for, plus who is asking: `viewer_id` is None for an anonymous visitor."""

    viewer_id: int | None
    viewer_sees_all: bool
    search: str = ""
    template: ExhibitionTemplate | None = None
    status: ExhibitionStatus | None = None
    author_id: int | None = None
    ids: list[int] = field(default_factory=list)


class IExhibitionRepository(Protocol):
    def get_all(
        self, filters: ExhibitionFilters, pagination_params: PaginationParams
    ) -> Page[Exhibition]: ...

    def get_by_id(self, exhibition_id: int) -> Exhibition | None: ...

    def get_by_slug(self, slug: str) -> Exhibition | None: ...

    def slug_exists(self, slug: str) -> bool: ...

    def add(self, exhibition: Exhibition) -> Exhibition: ...

    def save(self, exhibition: Exhibition) -> Exhibition: ...

    def delete(self, exhibition: Exhibition) -> None: ...


@inject(alias=IExhibitionRepository)
class ExhibitionRepository(IExhibitionRepository):
    def __init__(self, session_factory: ISessionFactory) -> None:
        self._session_factory = session_factory

    def get_all(
        self, filters: ExhibitionFilters, pagination_params: PaginationParams
    ) -> Page[Exhibition]:
        db = self._session_factory()
        query = (
            select(Exhibition)
            .options(
                selectinload(Exhibition.author),
                selectinload(Exhibition.sections).selectinload(Section.items),
                selectinload(Exhibition.videos),
            )
            .order_by(Exhibition.created_at.desc(), Exhibition.id.desc())
        )
        # Visibility: everyone sees published exhibitions, an author also their own, an admin all.
        if not filters.viewer_sees_all:
            visible = Exhibition.status == ExhibitionStatus.PUBLISHED
            if filters.viewer_id is not None:
                visible = or_(visible, Exhibition.author_id == filters.viewer_id)
            query = query.where(visible)
        if filters.template is not None:
            query = query.where(Exhibition.template == filters.template)
        if filters.status is not None:
            query = query.where(Exhibition.status == filters.status)
        if filters.author_id is not None:
            query = query.where(Exhibition.author_id == filters.author_id)
        if filters.ids:
            query = query.where(Exhibition.id.in_(filters.ids))
        if filters.search:
            pattern = f"%{filters.search.lower()}%"  # a bound parameter, not SQL
            haystack = func.lower(
                cast(Exhibition.title, String)
                + cast(Exhibition.summary, String)
                + cast(Exhibition.tags, String)
            )
            query = query.where(haystack.like(pattern))
        return paginate(query=query, pagination_params=pagination_params, db=db)

    def get_by_id(self, exhibition_id: int) -> Exhibition | None:
        db = self._session_factory()
        return db.get(Exhibition, exhibition_id)

    def get_by_slug(self, slug: str) -> Exhibition | None:
        db = self._session_factory()
        return db.scalar(select(Exhibition).where(Exhibition.slug == slug))

    def slug_exists(self, slug: str) -> bool:
        db = self._session_factory()
        return db.scalar(select(Exhibition.id).where(Exhibition.slug == slug)) is not None

    def add(self, exhibition: Exhibition) -> Exhibition:
        db = self._session_factory()
        db.add(exhibition)
        db.flush()  # assigns ids and created_at; the endpoint's session handler commits (ADR-009)
        db.refresh(exhibition)
        return exhibition

    def save(self, exhibition: Exhibition) -> Exhibition:
        db = self._session_factory()
        db.flush()
        db.refresh(exhibition)
        return exhibition

    def delete(self, exhibition: Exhibition) -> None:
        db = self._session_factory()
        db.delete(exhibition)
        db.flush()

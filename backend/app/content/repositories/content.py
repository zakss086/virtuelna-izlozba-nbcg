from __future__ import annotations

from typing import Protocol

from sqlalchemy import select

from app.content.models.content import ContentBlock
from app.database.session_factory import ISessionFactory
from app.utils.di import inject
from app.utils.pagination import Page, PaginationParams, paginate


class IContentRepository(Protocol):
    def get_all(self, pagination_params: PaginationParams) -> Page[ContentBlock]: ...

    def get_by_key(self, key: str) -> ContentBlock | None: ...

    def save(self, block: ContentBlock) -> ContentBlock: ...

    def delete(self, block: ContentBlock) -> None: ...


@inject(alias=IContentRepository)
class ContentRepository(IContentRepository):
    def __init__(self, session_factory: ISessionFactory) -> None:
        self._session_factory = session_factory

    def get_all(self, pagination_params: PaginationParams) -> Page[ContentBlock]:
        db = self._session_factory()
        query = select(ContentBlock).order_by(ContentBlock.key)
        return paginate(query=query, pagination_params=pagination_params, db=db)

    def get_by_key(self, key: str) -> ContentBlock | None:
        db = self._session_factory()
        return db.scalar(select(ContentBlock).where(ContentBlock.key == key))

    def save(self, block: ContentBlock) -> ContentBlock:
        db = self._session_factory()
        db.add(block)
        db.flush()  # assigns id and timestamps; the endpoint's session handler commits (ADR-009)
        db.refresh(block)
        return block

    def delete(self, block: ContentBlock) -> None:
        db = self._session_factory()
        db.delete(block)
        db.flush()

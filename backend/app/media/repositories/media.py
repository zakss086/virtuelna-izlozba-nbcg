from __future__ import annotations

from typing import Protocol

from sqlalchemy import select

from app.database.session_factory import ISessionFactory
from app.media.models.media import MediaAsset
from app.utils.di import inject
from app.utils.pagination import Page, PaginationParams, paginate


class IMediaRepository(Protocol):
    def get_all(
        self, uploaded_by_id: int | None, pagination_params: PaginationParams
    ) -> Page[MediaAsset]: ...

    def get_by_id(self, media_id: int) -> MediaAsset | None: ...

    def add(self, asset: MediaAsset) -> MediaAsset: ...

    def delete(self, asset: MediaAsset) -> None: ...


@inject(alias=IMediaRepository)
class MediaRepository(IMediaRepository):
    def __init__(self, session_factory: ISessionFactory) -> None:
        self._session_factory = session_factory

    def get_all(
        self, uploaded_by_id: int | None, pagination_params: PaginationParams
    ) -> Page[MediaAsset]:
        db = self._session_factory()
        query = select(MediaAsset).order_by(MediaAsset.created_at.desc(), MediaAsset.id.desc())
        if uploaded_by_id is not None:
            query = query.where(MediaAsset.uploaded_by_id == uploaded_by_id)
        return paginate(query=query, pagination_params=pagination_params, db=db)

    def get_by_id(self, media_id: int) -> MediaAsset | None:
        db = self._session_factory()
        return db.get(MediaAsset, media_id)

    def add(self, asset: MediaAsset) -> MediaAsset:
        db = self._session_factory()
        db.add(asset)
        db.flush()  # assigns id and created_at; the endpoint's session handler commits (ADR-009)
        db.refresh(asset)
        return asset

    def delete(self, asset: MediaAsset) -> None:
        db = self._session_factory()
        db.delete(asset)
        db.flush()

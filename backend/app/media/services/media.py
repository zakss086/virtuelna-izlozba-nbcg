from __future__ import annotations

from typing import BinaryIO, Protocol
from uuid import uuid4

from app.auth.schemas.auth import CurrentUser
from app.config.settings import Settings
from app.media.exceptions.media import (
    FileTooLargeException,
    MediaNotFoundException,
    NotMediaOwnerException,
    UnsupportedMediaTypeException,
)
from app.media.models.media import MediaAsset, MediaType
from app.media.repositories.media import IMediaRepository
from app.media.repositories.media_file import IMediaFileStore
from app.media.schemas.media import MediaAssetResponseSchema
from app.users.models.user import UserRole
from app.utils.di import inject
from app.utils.pagination import Page, PaginationParams

_MAX_FILENAME = 200
_EXTENSIONS = {
    MediaType.JPEG: "jpg",
    MediaType.PNG: "png",
    MediaType.WEBP: "webp",
    MediaType.GIF: "gif",
    MediaType.MP4: "mp4",
    MediaType.WEBM: "webm",
}


def sniff_media_type(head: bytes) -> MediaType | None:
    """The type of a file decided from its first bytes: the name and the header the client sent are not trusted."""
    if head.startswith(b"\xff\xd8\xff"):
        return MediaType.JPEG
    if head.startswith(b"\x89PNG\r\n\x1a\n"):
        return MediaType.PNG
    if head.startswith((b"GIF87a", b"GIF89a")):
        return MediaType.GIF
    if head[:4] == b"RIFF" and head[8:12] == b"WEBP":
        return MediaType.WEBP
    if head[4:8] == b"ftyp":
        return MediaType.MP4
    if head.startswith(b"\x1a\x45\xdf\xa3"):
        return MediaType.WEBM
    return None


class IMediaService(Protocol):
    def upload(
        self,
        stream: BinaryIO,
        filename: str,
        credit: str,
        license: str,
        source_url: str | None,
        current_user: CurrentUser,
    ) -> MediaAssetResponseSchema: ...

    def list(
        self, pagination_params: PaginationParams, current_user: CurrentUser
    ) -> Page[MediaAssetResponseSchema]: ...

    def delete(self, media_id: int, current_user: CurrentUser) -> None: ...


@inject(alias=IMediaService)
class MediaService(IMediaService):
    def __init__(
        self,
        media_repository: IMediaRepository,
        file_store: IMediaFileStore,
        settings: Settings,
    ) -> None:
        self._media_repository = media_repository
        self._file_store = file_store
        self._limit_mb = settings.MAX_UPLOAD_MB

    def upload(
        self,
        stream: BinaryIO,
        filename: str,
        credit: str,
        license: str,
        source_url: str | None,
        current_user: CurrentUser,
    ) -> MediaAssetResponseSchema:
        limit = self._limit_mb * 1024 * 1024
        data = stream.read(
            limit + 1
        )  # one byte more than allowed is enough to know it is too large
        if len(data) > limit:
            raise FileTooLargeException(self._limit_mb)
        media_type = sniff_media_type(data[:16])
        if media_type is None:
            raise UnsupportedMediaTypeException

        stored_name = f"{uuid4().hex}.{_EXTENSIONS[media_type]}"
        asset = MediaAsset(
            stored_name=stored_name,
            filename=filename.replace("\\", "/").rsplit("/", 1)[-1][:_MAX_FILENAME] or "file",
            content_type=media_type,
            size=len(data),
            credit=credit,
            license=license,
            source_url=source_url,
            # The uploader is always the signed-in user, never an id from the request (ADR-006).
            uploaded_by_id=current_user.id,
        )
        self._file_store.save(stored_name, data)
        try:
            saved = self._media_repository.add(asset)
        except Exception:
            # No record without a file, and no file without a record.
            self._file_store.delete(stored_name)
            raise
        return MediaAssetResponseSchema.model_validate(saved)

    def list(
        self, pagination_params: PaginationParams, current_user: CurrentUser
    ) -> Page[MediaAssetResponseSchema]:
        # A curator sees what they uploaded; an admin sees everything.
        owner = None if current_user.role == UserRole.ADMIN else current_user.id
        assets = self._media_repository.get_all(
            uploaded_by_id=owner, pagination_params=pagination_params
        )
        return Page(
            total=assets.total,
            items=[MediaAssetResponseSchema.model_validate(asset) for asset in assets.items],
            pages=assets.pages,
        )

    def delete(self, media_id: int, current_user: CurrentUser) -> None:
        asset = self._media_repository.get_by_id(media_id)
        if asset is None:
            raise MediaNotFoundException
        if asset.uploaded_by_id != current_user.id and current_user.role != UserRole.ADMIN:
            raise NotMediaOwnerException
        stored_name = asset.stored_name
        self._media_repository.delete(asset)
        self._file_store.delete(stored_name)

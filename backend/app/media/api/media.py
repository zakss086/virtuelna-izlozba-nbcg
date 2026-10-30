from __future__ import annotations

from typing import Annotated

from fastapi import Depends, File, Form, UploadFile, status

from app.auth.schemas.auth import CurrentUser
from app.database.session_handler import DBAPIRouter
from app.deps import get_current_user, get_di_entity
from app.media.schemas.media import MediaAssetResponseSchema
from app.media.services.media import IMediaService
from app.utils.pagination import Page, PaginationParams, get_pagination_params

router = DBAPIRouter(prefix="/media")


@router.get(
    path="",
    summary="List the media library",
    description="A curator sees their own files, an admin all of them. Newest first.",
)
def get_media(
    media_service: Annotated[IMediaService, Depends(get_di_entity(IMediaService))],
    pagination_params: Annotated[PaginationParams, Depends(get_pagination_params)],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> Page[MediaAssetResponseSchema]:
    return media_service.list(pagination_params=pagination_params, current_user=current_user)


@router.post(
    path="",
    status_code=status.HTTP_201_CREATED,
    summary="Upload a picture or a video",
    description=(
        "Multipart form: `file`, `credit` (author), `license` and an optional `sourceUrl`. The file type is"
        " decided from its content: JPEG, PNG, WebP, GIF, MP4 and WebM are accepted. The file is then served"
        " publicly at the returned `url`."
    ),
)
def upload_media(
    file: Annotated[UploadFile, File(description="The picture or video")],
    credit: Annotated[str, Form(min_length=1, max_length=200)],
    license: Annotated[str, Form(min_length=1, max_length=100)],
    media_service: Annotated[IMediaService, Depends(get_di_entity(IMediaService))],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
    source_url: Annotated[str, Form(alias="sourceUrl", max_length=2000)] = "",
) -> MediaAssetResponseSchema:
    return media_service.upload(
        stream=file.file,
        filename=file.filename or "file",
        credit=credit.strip(),
        license=license.strip(),
        source_url=source_url.strip() or None,
        current_user=current_user,
    )


@router.delete(
    path="/{media_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_model=None,
    summary="Delete a file (uploader or admin)",
    description="Exhibitions that still use the file show a missing picture.",
)
def delete_media(
    media_id: int,
    media_service: Annotated[IMediaService, Depends(get_di_entity(IMediaService))],
    current_user: Annotated[CurrentUser, Depends(get_current_user)],
) -> None:
    media_service.delete(media_id=media_id, current_user=current_user)

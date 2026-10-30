from __future__ import annotations

from app.media.models.media import MediaType
from app.utils.schemas import CamelCaseResponseModel, UtcDatetime


class MediaAssetResponseSchema(CamelCaseResponseModel):
    id: int
    url: str
    filename: str
    content_type: MediaType
    size: int
    credit: str
    license: str
    source_url: str | None
    uploaded_by_id: int | None
    created_at: UtcDatetime

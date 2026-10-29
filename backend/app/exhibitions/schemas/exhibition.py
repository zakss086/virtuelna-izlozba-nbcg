from __future__ import annotations

from pydantic import Field

from app.exhibitions.models.exhibition import ExhibitionStatus, ExhibitionTemplate, ItemType
from app.utils.schemas import CamelCaseModel, CamelCaseResponseModel, UtcDatetime

# Limits mirror the Zod schema of the editor (frontend/.../exhibition-form-model.ts) and docs/entities.md.
_URL_MAX = 100_000  # generated placeholder pictures are data URIs


class LocalizedSchema(CamelCaseResponseModel):
    """A text in both languages."""

    me: str = Field(min_length=1, max_length=20_000)
    en: str = Field(min_length=1, max_length=20_000)


class PlaceSchema(CamelCaseResponseModel):
    name: LocalizedSchema
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)


class ItemRequestSchema(CamelCaseModel):
    type: ItemType
    title: LocalizedSchema
    creator: str = Field(min_length=1, max_length=200)
    year: int | None = Field(default=None, ge=1, le=2100)
    collection: str = Field(min_length=1, max_length=200)
    image_url: str = Field(min_length=1, max_length=_URL_MAX)
    source_url: str = Field(min_length=1, max_length=_URL_MAX)
    rights: str = Field(min_length=1, max_length=200)
    signature: str | None = Field(default=None, max_length=100)
    inventory_no: str | None = Field(default=None, max_length=100)
    language: str | None = Field(default=None, max_length=100)
    material: str | None = Field(default=None, max_length=100)
    dimensions: str | None = Field(default=None, max_length=100)


class SectionRequestSchema(CamelCaseModel):
    title: LocalizedSchema
    text: LocalizedSchema
    year: int | None = Field(default=None, ge=1000, le=2100)
    place: PlaceSchema | None = None
    items: list[ItemRequestSchema] = Field(default_factory=list, max_length=100)


class VideoRequestSchema(CamelCaseModel):
    title: LocalizedSchema
    description: LocalizedSchema
    src: str = Field(min_length=1, max_length=_URL_MAX)
    credit: str = Field(min_length=1, max_length=200)
    license: str = Field(min_length=1, max_length=100)
    source_url: str = Field(min_length=1, max_length=_URL_MAX)


class ExhibitionCreateRequestSchema(CamelCaseModel):
    title: LocalizedSchema
    summary: LocalizedSchema
    intro: LocalizedSchema | None = None
    cover_url: str = Field(min_length=1, max_length=_URL_MAX)
    template: ExhibitionTemplate
    status: ExhibitionStatus = ExhibitionStatus.DRAFT
    period: str = Field(min_length=2, max_length=60)
    tags: list[str] = Field(default_factory=list, max_length=20)
    sections: list[SectionRequestSchema] = Field(min_length=1, max_length=100)
    videos: list[VideoRequestSchema] = Field(default_factory=list, max_length=50)


class ExhibitionUpdateRequestSchema(CamelCaseModel):
    """Every field optional: PATCH changes only what the client sends (`exclude_unset`).

    `sections` and `videos` replace the whole list when they are sent.
    """

    title: LocalizedSchema | None = None
    summary: LocalizedSchema | None = None
    intro: LocalizedSchema | None = None
    cover_url: str | None = Field(default=None, min_length=1, max_length=_URL_MAX)
    template: ExhibitionTemplate | None = None
    status: ExhibitionStatus | None = None
    period: str | None = Field(default=None, min_length=2, max_length=60)
    tags: list[str] | None = Field(default=None, max_length=20)
    sections: list[SectionRequestSchema] | None = Field(default=None, min_length=1, max_length=100)
    videos: list[VideoRequestSchema] | None = Field(default=None, max_length=50)


class StatusRequestSchema(CamelCaseModel):
    status: ExhibitionStatus


class ItemResponseSchema(CamelCaseResponseModel):
    id: int
    type: ItemType
    title: LocalizedSchema
    creator: str
    year: int | None
    collection: str
    image_url: str
    source_url: str
    rights: str
    signature: str | None
    inventory_no: str | None
    language: str | None
    material: str | None
    dimensions: str | None


class SectionResponseSchema(CamelCaseResponseModel):
    id: int
    title: LocalizedSchema
    text: LocalizedSchema
    year: int | None
    place: PlaceSchema | None
    items: list[ItemResponseSchema]


class VideoResponseSchema(CamelCaseResponseModel):
    id: int
    title: LocalizedSchema
    description: LocalizedSchema
    src: str
    credit: str
    license: str
    source_url: str


class ExhibitionResponseSchema(CamelCaseResponseModel):
    id: int
    slug: str
    title: LocalizedSchema
    summary: LocalizedSchema
    intro: LocalizedSchema | None
    cover_url: str
    template: ExhibitionTemplate
    status: ExhibitionStatus
    period: str
    tags: list[str]
    author_id: int
    author_name: str
    sections: list[SectionResponseSchema]
    videos: list[VideoResponseSchema]
    created_at: UtcDatetime

from __future__ import annotations

from pydantic import Field

from app.utils.schemas import CamelCaseModel, CamelCaseResponseModel, LocalizedSchema


class CollectionCreateRequestSchema(CamelCaseModel):
    name: LocalizedSchema
    text: LocalizedSchema
    href: str = Field(min_length=1, max_length=2000)
    image: str = Field(min_length=1, max_length=2000)
    position: int = Field(default=0, ge=0, le=10_000)


class CollectionUpdateRequestSchema(CamelCaseModel):
    """Every field optional: PATCH changes only what the client sends."""

    name: LocalizedSchema | None = None
    text: LocalizedSchema | None = None
    href: str | None = Field(default=None, min_length=1, max_length=2000)
    image: str | None = Field(default=None, min_length=1, max_length=2000)
    position: int | None = Field(default=None, ge=0, le=10_000)


class CollectionResponseSchema(CamelCaseResponseModel):
    id: int
    name: LocalizedSchema
    text: LocalizedSchema
    href: str
    image: str
    position: int

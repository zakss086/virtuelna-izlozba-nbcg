from __future__ import annotations

from pydantic import Field

from app.libraries.models.library import LibraryType, LocationPrecision
from app.utils.schemas import CamelCaseModel, CamelCaseResponseModel, LocalizedSchema


class LibraryImageSchema(CamelCaseResponseModel):
    url: str = Field(min_length=1, max_length=2000)
    credit: str = Field(min_length=1, max_length=200)
    license: str = Field(min_length=1, max_length=100)
    source_url: str = Field(min_length=1, max_length=2000)


class LibraryLocationSchema(CamelCaseResponseModel):
    lat: float = Field(ge=-90, le=90)
    lng: float = Field(ge=-180, le=180)
    precision: LocationPrecision


class LibraryCreateRequestSchema(CamelCaseModel):
    name: str = Field(min_length=2, max_length=200)
    type: LibraryType
    city: str = Field(min_length=1, max_length=100)
    address: str | None = Field(default=None, max_length=200)
    website: str | None = Field(default=None, max_length=2000)
    email: str | None = Field(default=None, max_length=254)
    phone: str | None = Field(default=None, max_length=60)
    description: LocalizedSchema | None = None
    image: LibraryImageSchema | None = None
    location: LibraryLocationSchema | None = None


class LibraryUpdateRequestSchema(CamelCaseModel):
    """Every field optional: PATCH changes only what the client sends; an explicit `null` clears an optional field."""

    name: str | None = Field(default=None, min_length=2, max_length=200)
    type: LibraryType | None = None
    city: str | None = Field(default=None, min_length=1, max_length=100)
    address: str | None = Field(default=None, max_length=200)
    website: str | None = Field(default=None, max_length=2000)
    email: str | None = Field(default=None, max_length=254)
    phone: str | None = Field(default=None, max_length=60)
    description: LocalizedSchema | None = None
    image: LibraryImageSchema | None = None
    location: LibraryLocationSchema | None = None


class LibraryResponseSchema(CamelCaseResponseModel):
    id: int
    name: str
    type: LibraryType
    city: str
    address: str | None
    website: str | None
    email: str | None
    phone: str | None
    description: LocalizedSchema | None
    image: LibraryImageSchema | None
    location: LibraryLocationSchema | None

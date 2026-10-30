from __future__ import annotations

from app.utils.schemas import CamelCaseModel, CamelCaseResponseModel, LocalizedSchema, UtcDatetime

# A key looks like a message key of the frontend: lowercase words and digits separated by dots.
KEY_PATTERN = r"^[a-z][a-z0-9]*(\.[a-z0-9]+)*$"


class ContentBlockUpdateRequestSchema(CamelCaseModel):
    value: LocalizedSchema


class ContentBlockResponseSchema(CamelCaseResponseModel):
    key: str
    value: LocalizedSchema
    updated_at: UtcDatetime

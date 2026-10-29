from __future__ import annotations

from datetime import UTC, datetime
from typing import Any

from pydantic_settings import SettingsConfigDict

from app.auth.schemas.auth import CurrentUser
from app.config.settings import Settings
from app.exhibitions.schemas.exhibition import ExhibitionResponseSchema
from app.users.models.user import UserRole


class TestSettings(Settings):
    """Settings for tests: never reads `.env`, so a developer's local config cannot leak in."""

    model_config = SettingsConfigDict(env_file=None, use_enum_values=True, extra="allow")


def create_current_user(
    id: int = 1, email: str = "test@example.com", role: UserRole = UserRole.CURATOR
) -> CurrentUser:
    return CurrentUser(
        id=id,
        email=email,
        name="Test User",
        role=role,
        created_at=datetime(2026, 1, 1, tzinfo=UTC),
    )


def localized(me: str, en: str) -> dict[str, str]:
    return {"me": me, "en": en}


def exhibition_body(**overrides: Any) -> dict[str, Any]:
    """A valid request body for POST /api/exhibitions (camelCase, as the frontend sends it)."""
    body: dict[str, Any] = {
        "title": localized("Nova izložba", "New exhibition"),
        "summary": localized("Kratak opis izložbe.", "A short summary."),
        "coverUrl": "https://example.com/cover.jpg",
        "template": "timeline",
        "period": "1494-1873",
        "tags": ["Montenegrina"],
        "sections": [
            {
                "title": localized("Prvi odjeljak", "First section"),
                "text": localized(
                    "Tekst prvog odjeljka je dovoljno dug.", "Text of the first section."
                ),
                "year": 1494,
                "items": [
                    {
                        "type": "book",
                        "title": localized("Oktoih", "Oktoih"),
                        "creator": "Makarije",
                        "year": 1494,
                        "collection": "Montenegrina",
                        "imageUrl": "https://example.com/oktoih.jpg",
                        "sourceUrl": "https://dlib.me",
                        "rights": "Public domain",
                        "language": "Ćirilica",
                    }
                ],
            }
        ],
    }
    body.update(overrides)
    return body


def exhibition_response(id: int = 1, status: str = "draft") -> ExhibitionResponseSchema:
    return ExhibitionResponseSchema.model_validate(
        {
            "id": id,
            "slug": "nova-izlozba",
            "title": localized("Nova izložba", "New exhibition"),
            "summary": localized("Kratak opis izložbe.", "A short summary."),
            "intro": None,
            "cover_url": "https://example.com/cover.jpg",
            "template": "timeline",
            "status": status,
            "period": "1494-1873",
            "tags": [],
            "author_id": 1,
            "author_name": "Test User",
            "sections": [],
            "videos": [],
            "created_at": datetime(2026, 1, 1, tzinfo=UTC),
        }
    )

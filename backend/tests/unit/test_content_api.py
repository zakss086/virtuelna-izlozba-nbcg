"""API layer only: the content service is a mock."""

from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from app.content.exceptions.content import ContentBlockNotFoundException
from app.content.schemas.content import ContentBlockResponseSchema
from app.users.exceptions.user import AdminOnlyException
from app.utils.pagination import Page

pytestmark = pytest.mark.unit

AUTH = {"Authorization": "Bearer token"}
BODY = {"value": {"me": "Novi tekst", "en": "New text"}}


def _block() -> ContentBlockResponseSchema:
    return ContentBlockResponseSchema.model_validate(
        {
            "key": "about.lead",
            "value": {"me": "Novi tekst", "en": "New text"},
            "updated_at": datetime(2026, 1, 1, tzinfo=UTC),
        }
    )


def test_list_is_public(client: TestClient, content_service: Mock) -> None:
    content_service.list.return_value = Page(total=1, items=[_block()], pages=1)

    response = client.get("/api/content")

    assert response.status_code == 200
    assert response.json()["items"][0] == {
        "key": "about.lead",
        "value": {"me": "Novi tekst", "en": "New text"},
        "updatedAt": "2026-01-01T00:00:00Z",
    }


def test_save_passes_key_and_user_to_the_service(client: TestClient, content_service: Mock) -> None:
    content_service.save.return_value = _block()

    response = client.put("/api/content/about.lead", json=BODY, headers=AUTH)

    assert response.status_code == 200
    kwargs = content_service.save.call_args.kwargs
    assert kwargs["key"] == "about.lead"
    assert kwargs["current_user"].id == 1
    assert kwargs["data"].value.me == "Novi tekst"


def test_save_without_token_is_401(client: TestClient, content_service: Mock) -> None:
    response = client.put("/api/content/about.lead", json=BODY)

    assert response.status_code == 401
    content_service.save.assert_not_called()


def test_save_by_a_curator_is_403(client: TestClient, content_service: Mock) -> None:
    content_service.save.side_effect = AdminOnlyException()

    response = client.put("/api/content/about.lead", json=BODY, headers=AUTH)

    assert response.status_code == 403
    assert response.json()["code"] == "admin_only"


def test_save_needs_both_languages(client: TestClient, content_service: Mock) -> None:
    response = client.put(
        "/api/content/about.lead", json={"value": {"me": "Samo crnogorski"}}, headers=AUTH
    )

    assert response.status_code == 422
    assert "value.en" in response.json()["fieldErrors"]
    content_service.save.assert_not_called()


@pytest.mark.parametrize("key", ["About.Lead", "about..lead", "1about", "about.lead.", "x" * 81])
def test_save_rejects_a_malformed_key(client: TestClient, content_service: Mock, key: str) -> None:
    response = client.put(f"/api/content/{key}", json=BODY, headers=AUTH)

    assert response.status_code == 422
    content_service.save.assert_not_called()


def test_reset_returns_204(client: TestClient, content_service: Mock) -> None:
    response = client.delete("/api/content/about.lead", headers=AUTH)

    assert response.status_code == 204
    assert response.content == b""
    content_service.reset.assert_called_once()


def test_reset_unknown_is_404(client: TestClient, content_service: Mock) -> None:
    content_service.reset.side_effect = ContentBlockNotFoundException()

    response = client.delete("/api/content/about.lead", headers=AUTH)

    assert response.status_code == 404
    assert response.json() == {
        "detail": "Content block not found",
        "code": "content_block_not_found",
    }


def test_reset_without_token_is_401(client: TestClient) -> None:
    assert client.delete("/api/content/about.lead").status_code == 401

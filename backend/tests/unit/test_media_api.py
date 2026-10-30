"""API layer only: the media service is a mock."""

from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from app.media.exceptions.media import (
    MediaNotFoundException,
    NotMediaOwnerException,
    UnsupportedMediaTypeException,
)
from app.media.schemas.media import MediaAssetResponseSchema
from app.utils.pagination import Page

pytestmark = pytest.mark.unit

AUTH = {"Authorization": "Bearer token"}
FORM = {"credit": "Wikimedia Commons", "license": "CC BY-SA 4.0"}


def _asset() -> MediaAssetResponseSchema:
    return MediaAssetResponseSchema.model_validate(
        {
            "id": 1,
            "url": "/media/abc.png",
            "filename": "kotor.png",
            "content_type": "image/png",
            "size": 10,
            "credit": "Wikimedia Commons",
            "license": "CC BY-SA 4.0",
            "source_url": None,
            "uploaded_by_id": 1,
            "created_at": datetime(2026, 1, 1, tzinfo=UTC),
        }
    )


def _upload(client: TestClient, **kwargs: object) -> object:
    return client.post(
        "/api/media",
        files={"file": ("kotor.png", b"\x89PNG\r\n\x1a\nrest", "image/png")},
        **kwargs,  # type: ignore[arg-type]
    )


def test_upload_returns_201_with_camel_case(client: TestClient, media_service: Mock) -> None:
    media_service.upload.return_value = _asset()

    response = client.post(
        "/api/media",
        data={**FORM, "sourceUrl": "https://commons.wikimedia.org/x"},
        files={"file": ("kotor.png", b"\x89PNG\r\n\x1a\nrest", "image/png")},
        headers=AUTH,
    )

    assert response.status_code == 201
    assert response.json()["contentType"] == "image/png"
    assert response.json()["url"] == "/media/abc.png"
    kwargs = media_service.upload.call_args.kwargs
    assert kwargs["filename"] == "kotor.png"
    assert kwargs["credit"] == "Wikimedia Commons"
    assert kwargs["source_url"] == "https://commons.wikimedia.org/x"
    assert kwargs["current_user"].id == 1


def test_upload_without_a_source_passes_none(client: TestClient, media_service: Mock) -> None:
    media_service.upload.return_value = _asset()

    client.post(
        "/api/media",
        data=FORM,
        files={"file": ("kotor.png", b"\x89PNG\r\n\x1a\nrest", "image/png")},
        headers=AUTH,
    )

    assert media_service.upload.call_args.kwargs["source_url"] is None


def test_upload_without_token_is_401(client: TestClient, media_service: Mock) -> None:
    response = client.post(
        "/api/media",
        data=FORM,
        files={"file": ("kotor.png", b"\x89PNG\r\n\x1a\nrest", "image/png")},
    )

    assert response.status_code == 401
    media_service.upload.assert_not_called()


def test_upload_needs_credit_and_license(client: TestClient, media_service: Mock) -> None:
    response = client.post(
        "/api/media",
        data={"credit": "", "license": "CC0"},
        files={"file": ("kotor.png", b"\x89PNG\r\n\x1a\nrest", "image/png")},
        headers=AUTH,
    )

    assert response.status_code == 422
    assert "credit" in response.json()["fieldErrors"]
    media_service.upload.assert_not_called()


def test_upload_without_a_file_is_422(client: TestClient, media_service: Mock) -> None:
    response = client.post("/api/media", data=FORM, headers=AUTH)

    assert response.status_code == 422
    assert "file" in response.json()["fieldErrors"]
    media_service.upload.assert_not_called()


def test_upload_of_a_wrong_type_is_400_with_field_error(
    client: TestClient, media_service: Mock
) -> None:
    media_service.upload.side_effect = UnsupportedMediaTypeException()

    response = client.post(
        "/api/media",
        data=FORM,
        files={"file": ("a.txt", b"hello", "text/plain")},
        headers=AUTH,
    )

    assert response.status_code == 400
    assert response.json()["code"] == "unsupported_media_type"
    assert "file" in response.json()["fieldErrors"]


def test_list_returns_a_page(client: TestClient, media_service: Mock) -> None:
    media_service.list.return_value = Page(total=1, items=[_asset()], pages=1)

    response = client.get("/api/media", headers=AUTH)

    assert response.status_code == 200
    assert response.json()["items"][0]["filename"] == "kotor.png"


def test_list_without_token_is_401(client: TestClient) -> None:
    assert client.get("/api/media").status_code == 401


def test_delete_returns_204(client: TestClient, media_service: Mock) -> None:
    response = client.delete("/api/media/1", headers=AUTH)

    assert response.status_code == 204
    assert media_service.delete.call_args.kwargs["media_id"] == 1


def test_delete_by_someone_else_is_403(client: TestClient, media_service: Mock) -> None:
    media_service.delete.side_effect = NotMediaOwnerException()

    response = client.delete("/api/media/1", headers=AUTH)

    assert response.status_code == 403
    assert response.json()["code"] == "not_media_owner"


def test_delete_unknown_is_404(client: TestClient, media_service: Mock) -> None:
    media_service.delete.side_effect = MediaNotFoundException()

    response = client.delete("/api/media/9", headers=AUTH)

    assert response.status_code == 404
    assert response.json() == {"detail": "Media file not found", "code": "media_not_found"}


def test_delete_without_token_is_401(client: TestClient) -> None:
    assert client.delete("/api/media/1").status_code == 401

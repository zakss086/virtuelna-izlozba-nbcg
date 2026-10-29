"""API layer only: the exhibition service is a mock."""

from __future__ import annotations

from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from app.exhibitions.exceptions.exhibition import (
    ExhibitionNotFoundException,
    NotExhibitionAuthorException,
    StatusChangeNotAllowedException,
)
from app.exhibitions.models.exhibition import ExhibitionStatus
from app.utils.pagination import Page
from tests.utils import exhibition_body, exhibition_response

pytestmark = pytest.mark.unit

AUTH = {"Authorization": "Bearer token"}


def test_list_passes_filters_to_the_service(client: TestClient, exhibition_service: Mock) -> None:
    exhibition_service.list.return_value = Page(total=1, items=[exhibition_response()], pages=1)

    response = client.get(
        "/api/exhibitions?search=oktoih&template=book&status=published&authorId=2&ids=1,3"
    )

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["authorName"] == "Test User"  # camelCase
    kwargs = exhibition_service.list.call_args.kwargs
    assert kwargs["current_user"] is None  # anonymous
    assert kwargs["search"] == "oktoih"
    assert kwargs["template"] == "book"
    assert kwargs["status"] == "published"
    assert kwargs["author_id"] == 2
    assert kwargs["ids"] == [1, 3]


def test_list_with_a_token_passes_the_user(client: TestClient, exhibition_service: Mock) -> None:
    exhibition_service.list.return_value = Page(total=0, items=[], pages=0)

    client.get("/api/exhibitions", headers=AUTH)

    assert exhibition_service.list.call_args.kwargs["current_user"].id == 1


def test_list_unknown_template_is_422(client: TestClient, exhibition_service: Mock) -> None:
    response = client.get("/api/exhibitions?template=nope")

    assert response.status_code == 422
    assert "template" in response.json()["fieldErrors"]
    exhibition_service.list.assert_not_called()


def test_get_unknown_is_404(client: TestClient, exhibition_service: Mock) -> None:
    exhibition_service.get.side_effect = ExhibitionNotFoundException()

    response = client.get("/api/exhibitions/nope")

    assert response.status_code == 404
    assert response.json() == {"detail": "Exhibition not found", "code": "exhibition_not_found"}


def test_create_returns_201(client: TestClient, exhibition_service: Mock) -> None:
    exhibition_service.create.return_value = exhibition_response()

    response = client.post("/api/exhibitions", json=exhibition_body(), headers=AUTH)

    assert response.status_code == 201
    assert exhibition_service.create.call_args.kwargs["current_user"].id == 1
    assert exhibition_service.create.call_args.kwargs["data"].template == "timeline"


def test_create_without_token_is_401(client: TestClient, exhibition_service: Mock) -> None:
    response = client.post("/api/exhibitions", json=exhibition_body())

    assert response.status_code == 401
    exhibition_service.create.assert_not_called()


def test_create_validates_the_body(client: TestClient, exhibition_service: Mock) -> None:
    response = client.post(
        "/api/exhibitions", json=exhibition_body(period="x", sections=[]), headers=AUTH
    )

    assert response.status_code == 422
    assert {"period", "sections"} <= set(response.json()["fieldErrors"])
    exhibition_service.create.assert_not_called()


def test_update_by_someone_else_is_403(client: TestClient, exhibition_service: Mock) -> None:
    exhibition_service.update.side_effect = NotExhibitionAuthorException()

    response = client.patch("/api/exhibitions/1", json={"period": "1900"}, headers=AUTH)

    assert response.status_code == 403
    assert response.json()["code"] == "not_exhibition_author"


def test_update_without_token_is_401(client: TestClient) -> None:
    assert client.patch("/api/exhibitions/1", json={"period": "1900"}).status_code == 401


def test_update_only_sends_given_fields(client: TestClient, exhibition_service: Mock) -> None:
    exhibition_service.update.return_value = exhibition_response()

    client.patch("/api/exhibitions/1", json={"period": "1900"}, headers=AUTH)

    data = exhibition_service.update.call_args.kwargs["data"]
    assert data.model_dump(exclude_unset=True) == {"period": "1900"}


def test_status_change_not_allowed_is_403_with_field_error(
    client: TestClient, exhibition_service: Mock
) -> None:
    exhibition_service.set_status.side_effect = StatusChangeNotAllowedException()

    response = client.patch("/api/exhibitions/1/status", json={"status": "published"}, headers=AUTH)

    assert response.status_code == 403
    assert response.json()["fieldErrors"] == {"status": "You are not allowed to set this status"}


def test_status_unknown_value_is_422(client: TestClient, exhibition_service: Mock) -> None:
    response = client.patch("/api/exhibitions/1/status", json={"status": "archived"}, headers=AUTH)

    assert response.status_code == 422
    exhibition_service.set_status.assert_not_called()


def test_status_ok(client: TestClient, exhibition_service: Mock) -> None:
    exhibition_service.set_status.return_value = exhibition_response(status="pending")

    response = client.patch("/api/exhibitions/1/status", json={"status": "pending"}, headers=AUTH)

    assert response.status_code == 200
    assert exhibition_service.set_status.call_args.kwargs["status"] == ExhibitionStatus.PENDING


def test_delete_returns_204_without_body(client: TestClient, exhibition_service: Mock) -> None:
    response = client.delete("/api/exhibitions/1", headers=AUTH)

    assert response.status_code == 204
    assert response.content == b""
    exhibition_service.delete.assert_called_once()


def test_delete_without_token_is_401(client: TestClient) -> None:
    assert client.delete("/api/exhibitions/1").status_code == 401

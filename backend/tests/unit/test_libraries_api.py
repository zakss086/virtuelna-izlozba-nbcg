"""API layer only: the library and collection services are mocks."""

from __future__ import annotations

from typing import Any
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from app.libraries.exceptions.library import LibraryNotFoundException
from app.libraries.schemas.library import LibraryResponseSchema
from app.users.exceptions.user import AdminOnlyException
from app.utils.pagination import Page

pytestmark = pytest.mark.unit

AUTH = {"Authorization": "Bearer token"}
BODY: dict[str, Any] = {"name": "Biblioteka Kotor", "type": "public", "city": "Kotor"}


def _library() -> LibraryResponseSchema:
    return LibraryResponseSchema.model_validate(
        {
            "id": 1,
            "name": "Biblioteka Kotor",
            "type": "public",
            "city": "Kotor",
            "address": None,
            "website": None,
            "email": None,
            "phone": None,
            "description": None,
            "image": None,
            "location": {"lat": 42.4, "lng": 18.7, "precision": "town"},
        }
    )


def test_list_is_public_and_passes_filters(client: TestClient, library_service: Mock) -> None:
    library_service.list.return_value = Page(total=1, items=[_library()], pages=1)

    response = client.get("/api/libraries?type=public&city=Kotor")

    assert response.status_code == 200
    assert response.json()["items"][0]["location"]["precision"] == "town"
    kwargs = library_service.list.call_args.kwargs
    assert (kwargs["library_type"], kwargs["city"]) == ("public", "Kotor")


def test_list_unknown_type_is_422(client: TestClient, library_service: Mock) -> None:
    response = client.get("/api/libraries?type=nope")

    assert response.status_code == 422
    library_service.list.assert_not_called()


def test_get_unknown_is_404(client: TestClient, library_service: Mock) -> None:
    library_service.get.side_effect = LibraryNotFoundException()

    response = client.get("/api/libraries/9")

    assert response.status_code == 404
    assert response.json() == {"detail": "Library not found", "code": "library_not_found"}


def test_create_returns_201(client: TestClient, library_service: Mock) -> None:
    library_service.create.return_value = _library()

    response = client.post("/api/libraries", json=BODY, headers=AUTH)

    assert response.status_code == 201
    assert library_service.create.call_args.kwargs["current_user"].id == 1


def test_create_without_token_is_401(client: TestClient, library_service: Mock) -> None:
    assert client.post("/api/libraries", json=BODY).status_code == 401
    library_service.create.assert_not_called()


def test_create_by_a_curator_is_403(client: TestClient, library_service: Mock) -> None:
    library_service.create.side_effect = AdminOnlyException()

    assert client.post("/api/libraries", json=BODY, headers=AUTH).status_code == 403


def test_create_with_a_bad_position_is_422(client: TestClient, library_service: Mock) -> None:
    bad = {**BODY, "location": {"lat": 200, "lng": 0, "precision": "exact"}}

    response = client.post("/api/libraries", json=bad, headers=AUTH)

    assert response.status_code == 422
    library_service.create.assert_not_called()


def test_update_sends_only_given_fields(client: TestClient, library_service: Mock) -> None:
    library_service.update.return_value = _library()

    client.patch("/api/libraries/1", json={"city": "Perast"}, headers=AUTH)

    data = library_service.update.call_args.kwargs["data"]
    assert data.model_dump(exclude_unset=True) == {"city": "Perast"}


def test_delete_returns_204(client: TestClient, library_service: Mock) -> None:
    response = client.delete("/api/libraries/1", headers=AUTH)

    assert response.status_code == 204
    library_service.delete.assert_called_once()

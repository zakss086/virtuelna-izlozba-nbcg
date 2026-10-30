from __future__ import annotations

from typing import Any

from fastapi.testclient import TestClient

LIBRARY: dict[str, Any] = {
    "name": "Nacionalna biblioteka Crne Gore „Đurđe Crnojević“",
    "type": "national",
    "city": "Cetinje",
    "address": "Novice Cerovića 2",
    "website": "https://www.nb-cg.me",
    "description": {"me": "Nacionalna biblioteka.", "en": "The national library."},
    "image": {
        "url": "https://commons.wikimedia.org/x.jpg",
        "credit": "Wikimedia Commons",
        "license": "CC BY-SA 4.0",
        "sourceUrl": "https://commons.wikimedia.org/wiki/File:x.jpg",
    },
    "location": {"lat": 42.3896, "lng": 18.9246, "precision": "exact"},
}


def _create(client: TestClient, headers: dict[str, str], **overrides: Any) -> dict[str, Any]:
    response = client.post("/api/libraries", json={**LIBRARY, **overrides}, headers=headers)
    assert response.status_code == 201, response.text
    body: dict[str, Any] = response.json()
    return body


def test_admin_creates_and_everyone_reads(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    created = _create(client, admin_headers)

    assert created["location"] == {"lat": 42.3896, "lng": 18.9246, "precision": "exact"}
    assert created["image"]["sourceUrl"].endswith("x.jpg")  # camelCase
    assert created["phone"] is None

    listed = client.get("/api/libraries").json()  # no token
    assert listed["total"] == 1
    assert client.get(f"/api/libraries/{created['id']}").json()["name"].startswith("Nacionalna")


def test_a_library_without_a_position_has_no_location(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    created = _create(client, admin_headers, location=None, image=None, description=None)

    assert created["location"] is None
    assert created["image"] is None


def test_curator_cannot_write(client: TestClient, auth_headers: dict[str, str]) -> None:
    response = client.post("/api/libraries", json=LIBRARY, headers=auth_headers)

    assert response.status_code == 403
    assert response.json()["code"] == "admin_only"


def test_writes_without_token_are_401(client: TestClient) -> None:
    assert client.post("/api/libraries", json=LIBRARY).status_code == 401
    assert client.patch("/api/libraries/1", json={"city": "Kotor"}).status_code == 401
    assert client.delete("/api/libraries/1").status_code == 401


def test_invalid_input_is_422(client: TestClient, admin_headers: dict[str, str]) -> None:
    response = client.post(
        "/api/libraries",
        json={**LIBRARY, "type": "nope", "location": {"lat": 120, "lng": 0, "precision": "exact"}},
        headers=admin_headers,
    )

    assert response.status_code == 422
    assert {"type", "location.lat"} <= set(response.json()["fieldErrors"])


def test_filters_by_type_and_city(client: TestClient, admin_headers: dict[str, str]) -> None:
    _create(client, admin_headers)
    _create(client, admin_headers, name="Gradska biblioteka Kotor", type="public", city="Kotor")

    assert client.get("/api/libraries?type=public").json()["total"] == 1
    assert client.get("/api/libraries?city=cetinje").json()["total"] == 1  # case-insensitive
    assert client.get("/api/libraries?type=public&city=Cetinje").json()["total"] == 0


def test_patch_changes_only_what_is_sent_and_can_clear(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    created = _create(client, admin_headers)

    response = client.patch(
        f"/api/libraries/{created['id']}",
        json={"city": "Kotor", "location": None, "phone": "+382 41 000 000"},
        headers=admin_headers,
    )

    body = response.json()
    assert response.status_code == 200
    assert (body["city"], body["phone"]) == ("Kotor", "+382 41 000 000")
    assert body["location"] is None  # cleared
    assert body["name"] == LIBRARY["name"]  # untouched
    assert body["image"]["credit"] == "Wikimedia Commons"


def test_patch_cannot_clear_the_name(client: TestClient, admin_headers: dict[str, str]) -> None:
    created = _create(client, admin_headers)

    response = client.patch(
        f"/api/libraries/{created['id']}", json={"name": None}, headers=admin_headers
    )

    assert response.status_code == 200
    assert response.json()["name"] == LIBRARY["name"]


def test_unknown_library_is_404(client: TestClient, admin_headers: dict[str, str]) -> None:
    assert client.get("/api/libraries/999").json()["code"] == "library_not_found"
    assert client.patch("/api/libraries/999", json={}, headers=admin_headers).status_code == 404
    assert client.delete("/api/libraries/999", headers=admin_headers).status_code == 404


def test_delete(client: TestClient, admin_headers: dict[str, str]) -> None:
    created = _create(client, admin_headers)

    assert (
        client.delete(f"/api/libraries/{created['id']}", headers=admin_headers).status_code == 204
    )
    assert client.get("/api/libraries").json()["total"] == 0

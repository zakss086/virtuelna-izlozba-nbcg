from __future__ import annotations

from typing import Any

from fastapi.testclient import TestClient

COLLECTION: dict[str, Any] = {
    "name": {"me": "Knjige", "en": "Books"},
    "text": {"me": "Stare i rijetke knjige.", "en": "Old and rare books."},
    "href": "https://dlib.me/me/knjige",
    "image": "https://commons.wikimedia.org/x.png",
}


def _create(client: TestClient, headers: dict[str, str], **overrides: Any) -> dict[str, Any]:
    response = client.post("/api/collections", json={**COLLECTION, **overrides}, headers=headers)
    assert response.status_code == 201, response.text
    body: dict[str, Any] = response.json()
    return body


def test_admin_creates_and_everyone_reads(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    created = _create(client, admin_headers)

    assert created["name"] == {"me": "Knjige", "en": "Books"}
    assert created["position"] == 0
    assert client.get("/api/collections").json()["total"] == 1  # no token


def test_listed_by_position(client: TestClient, admin_headers: dict[str, str]) -> None:
    _create(client, admin_headers, name={"me": "Druga", "en": "Second"}, position=2)
    _create(client, admin_headers, name={"me": "Prva", "en": "First"}, position=1)

    names = [item["name"]["en"] for item in client.get("/api/collections").json()["items"]]

    assert names == ["First", "Second"]


def test_curator_cannot_write(client: TestClient, auth_headers: dict[str, str]) -> None:
    assert client.post("/api/collections", json=COLLECTION, headers=auth_headers).status_code == 403


def test_writes_without_token_are_401(client: TestClient) -> None:
    assert client.post("/api/collections", json=COLLECTION).status_code == 401
    assert client.patch("/api/collections/1", json={"position": 1}).status_code == 401
    assert client.delete("/api/collections/1").status_code == 401


def test_both_languages_are_required(client: TestClient, admin_headers: dict[str, str]) -> None:
    response = client.post(
        "/api/collections",
        json={**COLLECTION, "name": {"me": "Knjige", "en": ""}},
        headers=admin_headers,
    )

    assert response.status_code == 422
    assert "name.en" in response.json()["fieldErrors"]


def test_patch_and_delete(client: TestClient, admin_headers: dict[str, str]) -> None:
    created = _create(client, admin_headers)

    patched = client.patch(
        f"/api/collections/{created['id']}",
        json={"text": {"me": "Novi opis.", "en": "A new text."}},
        headers=admin_headers,
    )

    assert patched.json()["text"]["en"] == "A new text."
    assert patched.json()["href"] == COLLECTION["href"]
    assert (
        client.delete(f"/api/collections/{created['id']}", headers=admin_headers).status_code == 204
    )
    assert (
        client.delete(f"/api/collections/{created['id']}", headers=admin_headers).status_code == 404
    )
    assert client.patch("/api/collections/999", json={}, headers=admin_headers).json()["code"] == (
        "collection_not_found"
    )

from __future__ import annotations

from fastapi.testclient import TestClient

BODY = {"value": {"me": "Novi tekst", "en": "New text"}}


def test_list_starts_empty_and_is_public(client: TestClient) -> None:
    response = client.get("/api/content")

    assert response.status_code == 200
    assert response.json()["total"] == 0
    assert response.json()["items"] == []


def test_admin_saves_then_everyone_reads(client: TestClient, admin_headers: dict[str, str]) -> None:
    saved = client.put("/api/content/about.lead", json=BODY, headers=admin_headers)

    assert saved.status_code == 200
    assert saved.json()["key"] == "about.lead"
    assert saved.json()["value"] == {"me": "Novi tekst", "en": "New text"}

    listed = client.get("/api/content").json()
    assert listed["total"] == 1
    assert listed["items"][0]["updatedAt"].endswith("Z")


def test_saving_again_replaces_the_text_not_adds_a_row(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    client.put("/api/content/about.lead", json=BODY, headers=admin_headers)
    changed = {"value": {"me": "Izmijenjeno", "en": "Changed"}}

    client.put("/api/content/about.lead", json=changed, headers=admin_headers)

    listed = client.get("/api/content").json()
    assert listed["total"] == 1
    assert listed["items"][0]["value"]["en"] == "Changed"


def test_curator_cannot_save(client: TestClient, auth_headers: dict[str, str]) -> None:
    response = client.put("/api/content/about.lead", json=BODY, headers=auth_headers)

    assert response.status_code == 403
    assert response.json()["code"] == "admin_only"
    assert client.get("/api/content").json()["total"] == 0


def test_save_without_token_is_401(client: TestClient) -> None:
    assert client.put("/api/content/about.lead", json=BODY).status_code == 401


def test_save_with_one_language_is_422(client: TestClient, admin_headers: dict[str, str]) -> None:
    response = client.put(
        "/api/content/about.lead", json={"value": {"me": "x", "en": ""}}, headers=admin_headers
    )

    assert response.status_code == 422
    assert "value.en" in response.json()["fieldErrors"]


def test_reset_brings_the_default_back(client: TestClient, admin_headers: dict[str, str]) -> None:
    client.put("/api/content/about.lead", json=BODY, headers=admin_headers)

    deleted = client.delete("/api/content/about.lead", headers=admin_headers)

    assert deleted.status_code == 204
    assert client.get("/api/content").json()["total"] == 0
    assert client.delete("/api/content/about.lead", headers=admin_headers).status_code == 404


def test_curator_cannot_reset(
    client: TestClient, admin_headers: dict[str, str], other_auth_headers: dict[str, str]
) -> None:
    client.put("/api/content/about.lead", json=BODY, headers=admin_headers)

    response = client.delete("/api/content/about.lead", headers=other_auth_headers)

    assert response.status_code == 403
    assert client.get("/api/content").json()["total"] == 1

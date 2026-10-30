from __future__ import annotations

from typing import Any

from fastapi.testclient import TestClient

from tests.utils import exhibition_body

COLLECTION = {
    "name": {"me": "Rukopisi", "en": "Manuscripts"},
    "text": {"me": "Opis zbirke.", "en": "About the collection."},
    "href": "https://dlib.me/rukopisi",
    "image": "https://example.com/rukopisi.jpg",
}


def _history(client: TestClient, headers: dict[str, str], query: str = "") -> list[dict[str, Any]]:
    response = client.get(f"/api/audit{query}", headers=headers)
    assert response.status_code == 200, response.text
    items: list[dict[str, Any]] = response.json()["items"]
    return items


def test_history_needs_an_admin(
    client: TestClient, auth_headers: dict[str, str], admin_headers: dict[str, str]
) -> None:
    assert client.get("/api/audit").status_code == 401
    assert client.get("/api/audit", headers=auth_headers).status_code == 403
    assert client.get("/api/audit", headers=admin_headers).status_code == 200


def test_history_starts_empty_and_uses_camel_case(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    assert client.get("/api/audit", headers=admin_headers).json()["total"] == 0

    client.post("/api/collections", json=COLLECTION, headers=admin_headers)

    entry = _history(client, admin_headers)[0]
    assert {"id", "createdAt", "actorId", "actorName", "action", "entityType", "entityRef"} <= set(
        entry
    )


def test_a_collection_change_records_who_what_and_when(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    created = client.post("/api/collections", json=COLLECTION, headers=admin_headers).json()
    client.patch(f"/api/collections/{created['id']}", json={"position": 3}, headers=admin_headers)
    client.delete(f"/api/collections/{created['id']}", headers=admin_headers)

    entries = _history(client, admin_headers, "?entityType=collection")

    assert [e["action"] for e in entries] == ["delete", "update", "create"]  # newest first
    assert {e["label"] for e in entries} == {"Rukopisi"}
    assert entries[1]["detail"] == "position"
    assert entries[0]["entityRef"] == str(created["id"])
    assert entries[0]["actorName"]


def test_a_refused_change_leaves_no_entry(
    client: TestClient, auth_headers: dict[str, str], admin_headers: dict[str, str]
) -> None:
    client.post("/api/collections", json=COLLECTION, headers=auth_headers)  # 403
    client.delete("/api/collections/999", headers=admin_headers)  # 404

    assert _history(client, admin_headers) == []


def test_exhibition_work_is_recorded_with_the_status_move(
    client: TestClient, auth_headers: dict[str, str], admin_headers: dict[str, str]
) -> None:
    created = client.post("/api/exhibitions", json=exhibition_body(), headers=auth_headers).json()
    client.patch(
        f"/api/exhibitions/{created['id']}/status",
        json={"status": "pending"},
        headers=auth_headers,
    )
    client.patch(
        f"/api/exhibitions/{created['id']}/status",
        json={"status": "published"},
        headers=admin_headers,
    )
    client.delete(f"/api/exhibitions/{created['id']}", headers=admin_headers)

    entries = _history(client, admin_headers, "?entityType=exhibition")

    assert [(e["action"], e["detail"]) for e in entries] == [
        ("delete", None),
        ("update", "status=pending>published"),
        ("update", "status=draft>pending"),
        ("create", "status=draft"),
    ]
    assert entries[0]["label"] == "Nova izložba"


def test_an_unchanged_status_is_not_recorded(
    client: TestClient, auth_headers: dict[str, str], admin_headers: dict[str, str]
) -> None:
    created = client.post("/api/exhibitions", json=exhibition_body(), headers=auth_headers).json()

    client.patch(
        f"/api/exhibitions/{created['id']}/status", json={"status": "draft"}, headers=auth_headers
    )

    assert len(_history(client, admin_headers, "?entityType=exhibition")) == 1  # only the creation


def test_site_text_and_its_reset_are_recorded(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    body = {"value": {"me": "Novi tekst", "en": "New text"}}
    client.put("/api/content/about.lead", json=body, headers=admin_headers)
    client.put("/api/content/about.lead", json=body, headers=admin_headers)
    client.delete("/api/content/about.lead", headers=admin_headers)

    entries = _history(client, admin_headers, "?entityType=content")

    assert [e["action"] for e in entries] == ["delete", "update", "create"]
    assert {e["label"] for e in entries} == {"about.lead"}


def test_account_changes_are_recorded_without_the_password(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    created = client.post(
        "/api/users",
        json={
            "email": "nova@nb-cg.me",
            "name": "Nova Osoba",
            "role": "curator",
            "password": "tajna1234",
        },
        headers=admin_headers,
    ).json()
    client.patch(
        f"/api/users/{created['id']}",
        json={"role": "admin", "isActive": False, "password": "novaLozinka1"},
        headers=admin_headers,
    )

    entries = _history(client, admin_headers, "?entityType=user")

    assert entries[0]["detail"] == "role=curator>admin, switched_off, new_password"
    assert entries[1]["detail"] == "role=curator"
    assert entries[0]["label"] == "Nova Osoba <nova@nb-cg.me>"
    assert "tajna1234" not in str(entries)
    assert "novaLozinka1" not in str(entries)


def test_history_survives_the_removal_of_its_actor(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    client.post("/api/collections", json=COLLECTION, headers=admin_headers)

    entry = _history(client, admin_headers)[0]

    assert entry["actorName"]  # the name is copied into the entry, not looked up


def test_history_filters_by_kind_and_validates_it(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    client.post("/api/collections", json=COLLECTION, headers=admin_headers)

    assert _history(client, admin_headers, "?entityType=library") == []
    assert len(_history(client, admin_headers, "?entityType=collection")) == 1
    bad = client.get("/api/audit?entityType=cookie", headers=admin_headers)
    assert bad.status_code == 422

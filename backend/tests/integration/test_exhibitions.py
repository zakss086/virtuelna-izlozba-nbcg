from __future__ import annotations

from fastapi.testclient import TestClient

from tests.utils import exhibition_body


def _publish(client: TestClient, exhibition_id: int, admin_headers: dict[str, str]) -> None:
    response = client.patch(
        f"/api/exhibitions/{exhibition_id}/status",
        json={"status": "published"},
        headers=admin_headers,
    )
    assert response.status_code == 200, response.text


def test_create_returns_the_whole_exhibition(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.post("/api/exhibitions", json=exhibition_body(), headers=auth_headers)

    assert response.status_code == 201
    body = response.json()
    assert body["slug"] == "nova-izlozba"
    assert body["status"] == "draft"
    assert body["authorName"] == "Ana"  # the author is the signed-in user
    section = body["sections"][0]
    assert section["items"][0]["imageUrl"] == "https://example.com/oktoih.jpg"  # camelCase
    assert section["items"][0]["language"] == "Ćirilica"
    assert section["place"] is None


def test_create_twice_gives_unique_slugs(client: TestClient, auth_headers: dict[str, str]) -> None:
    first = client.post("/api/exhibitions", json=exhibition_body(), headers=auth_headers)
    second = client.post("/api/exhibitions", json=exhibition_body(), headers=auth_headers)

    assert (first.json()["slug"], second.json()["slug"]) == ("nova-izlozba", "nova-izlozba-2")


def test_create_ignores_an_author_in_the_body(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.post(
        "/api/exhibitions", json=exhibition_body(authorId=999, authorName="X"), headers=auth_headers
    )

    assert response.status_code == 201
    assert response.json()["authorId"] != 999


def test_create_without_token_is_401(client: TestClient) -> None:
    response = client.post("/api/exhibitions", json=exhibition_body())

    assert response.status_code == 401
    assert response.json()["code"] == "not_authenticated"


def test_create_invalid_is_422_with_field_errors(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.post(
        "/api/exhibitions",
        json=exhibition_body(template="nope", period="x", sections=[]),
        headers=auth_headers,
    )

    assert response.status_code == 422
    assert {"template", "period", "sections"} <= set(response.json()["fieldErrors"])


def test_curator_cannot_create_a_published_exhibition(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    response = client.post(
        "/api/exhibitions", json=exhibition_body(status="published"), headers=auth_headers
    )

    assert response.status_code == 403
    assert response.json()["code"] == "status_change_not_allowed"


def test_anonymous_sees_only_published(
    client: TestClient, exhibition_id: int, admin_headers: dict[str, str]
) -> None:
    assert client.get("/api/exhibitions").json()["total"] == 0
    assert client.get(f"/api/exhibitions/{exhibition_id}").status_code == 404
    assert client.get("/api/exhibitions/nova-izlozba").status_code == 404

    _publish(client, exhibition_id, admin_headers)

    assert client.get("/api/exhibitions").json()["total"] == 1
    assert client.get("/api/exhibitions/nova-izlozba").json()["id"] == exhibition_id
    assert client.get(f"/api/exhibitions/{exhibition_id}").status_code == 200


def test_author_and_admin_see_a_draft_others_do_not(
    client: TestClient,
    exhibition_id: int,
    auth_headers: dict[str, str],
    other_auth_headers: dict[str, str],
    admin_headers: dict[str, str],
) -> None:
    assert client.get(f"/api/exhibitions/{exhibition_id}", headers=auth_headers).status_code == 200
    assert client.get(f"/api/exhibitions/{exhibition_id}", headers=admin_headers).status_code == 200
    assert (
        client.get(f"/api/exhibitions/{exhibition_id}", headers=other_auth_headers).status_code
        == 404
    )
    assert client.get("/api/exhibitions", headers=auth_headers).json()["total"] == 1
    assert client.get("/api/exhibitions", headers=other_auth_headers).json()["total"] == 0


def test_list_filters(
    client: TestClient, auth_headers: dict[str, str], admin_headers: dict[str, str]
) -> None:
    book = client.post(
        "/api/exhibitions",
        json=exhibition_body(
            template="book", title={"me": "Knjige i listovi", "en": "Books and papers"}
        ),
        headers=auth_headers,
    ).json()
    timeline = client.post("/api/exhibitions", json=exhibition_body(), headers=auth_headers).json()
    for exhibition in (book, timeline):
        _publish(client, exhibition["id"], admin_headers)

    assert client.get("/api/exhibitions?template=book").json()["total"] == 1
    assert client.get("/api/exhibitions?search=KNJIGE").json()["total"] == 1
    assert client.get("/api/exhibitions?search=montenegrina").json()["total"] == 2  # tag
    assert client.get(f"/api/exhibitions?ids={book['id']}").json()["total"] == 1
    assert client.get(f"/api/exhibitions?authorId={book['authorId']}").json()["total"] == 2
    assert client.get("/api/exhibitions?status=draft", headers=admin_headers).json()["total"] == 0


def test_list_is_newest_first_and_paginated(
    client: TestClient, auth_headers: dict[str, str], admin_headers: dict[str, str]
) -> None:
    ids = []
    for index in range(3):
        created = client.post(
            "/api/exhibitions",
            json=exhibition_body(title={"me": f"Izložba {index}", "en": f"Exhibition {index}"}),
            headers=auth_headers,
        ).json()
        _publish(client, created["id"], admin_headers)
        ids.append(created["id"])

    page = client.get("/api/exhibitions?size=2&page=1").json()

    assert (page["total"], page["pages"]) == (3, 2)
    assert [item["id"] for item in page["items"]] == [ids[2], ids[1]]


def test_author_updates_and_replaces_sections(
    client: TestClient, exhibition_id: int, auth_headers: dict[str, str]
) -> None:
    section = exhibition_body()["sections"][0]

    response = client.patch(
        f"/api/exhibitions/{exhibition_id}",
        json={"period": "1900", "sections": [section, section]},
        headers=auth_headers,
    )

    assert response.status_code == 200
    body = response.json()
    assert body["period"] == "1900"
    assert len(body["sections"]) == 2
    assert body["title"]["me"] == "Nova izložba"  # untouched fields stay


def test_update_by_other_curator_is_403_once_published(
    client: TestClient,
    exhibition_id: int,
    other_auth_headers: dict[str, str],
    admin_headers: dict[str, str],
) -> None:
    _publish(client, exhibition_id, admin_headers)

    response = client.patch(
        f"/api/exhibitions/{exhibition_id}", json={"period": "1900"}, headers=other_auth_headers
    )

    assert response.status_code == 403
    assert response.json()["code"] == "not_exhibition_author"


def test_update_unknown_is_404(client: TestClient, auth_headers: dict[str, str]) -> None:
    response = client.patch("/api/exhibitions/999", json={"period": "1900"}, headers=auth_headers)

    assert response.status_code == 404
    assert response.json()["code"] == "exhibition_not_found"


def test_status_flow(
    client: TestClient,
    exhibition_id: int,
    auth_headers: dict[str, str],
    admin_headers: dict[str, str],
) -> None:
    url = f"/api/exhibitions/{exhibition_id}/status"

    submitted = client.patch(url, json={"status": "pending"}, headers=auth_headers)
    assert submitted.json()["status"] == "pending"

    forbidden = client.patch(url, json={"status": "published"}, headers=auth_headers)
    assert forbidden.status_code == 403
    assert forbidden.json()["code"] == "status_change_not_allowed"

    published = client.patch(url, json={"status": "published"}, headers=admin_headers)
    assert published.json()["status"] == "published"

    # an author cannot pull a published exhibition back; an admin can
    assert client.patch(url, json={"status": "draft"}, headers=auth_headers).status_code == 403
    assert client.patch(url, json={"status": "draft"}, headers=admin_headers).status_code == 200


def test_author_keeps_a_published_exhibition_when_editing_it(
    client: TestClient,
    exhibition_id: int,
    auth_headers: dict[str, str],
    admin_headers: dict[str, str],
) -> None:
    _publish(client, exhibition_id, admin_headers)

    response = client.patch(
        f"/api/exhibitions/{exhibition_id}",
        json={"status": "published", "period": "1901"},
        headers=auth_headers,
    )

    assert response.status_code == 200
    assert response.json()["status"] == "published"


def test_delete_by_author_then_404(
    client: TestClient, exhibition_id: int, auth_headers: dict[str, str]
) -> None:
    deleted = client.delete(f"/api/exhibitions/{exhibition_id}", headers=auth_headers)

    assert deleted.status_code == 204
    assert (
        client.delete(f"/api/exhibitions/{exhibition_id}", headers=auth_headers).status_code == 404
    )


def test_delete_by_other_curator_is_404_for_a_draft_and_403_for_a_published_one(
    client: TestClient,
    exhibition_id: int,
    other_auth_headers: dict[str, str],
    admin_headers: dict[str, str],
) -> None:
    url = f"/api/exhibitions/{exhibition_id}"
    assert client.delete(url, headers=other_auth_headers).status_code == 404  # hidden draft

    _publish(client, exhibition_id, admin_headers)

    assert client.delete(url, headers=other_auth_headers).status_code == 403
    assert client.delete(url, headers=admin_headers).status_code == 204


def test_delete_without_token_is_401(client: TestClient, exhibition_id: int) -> None:
    assert client.delete(f"/api/exhibitions/{exhibition_id}").status_code == 401

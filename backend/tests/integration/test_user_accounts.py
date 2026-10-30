from __future__ import annotations

from typing import Any

from fastapi.testclient import TestClient

NEW_USER = {
    "email": "Nova@NB-CG.me",
    "name": "Nova Osoba",
    "role": "curator",
    "password": "tajna1234",
}


def _create(client: TestClient, headers: dict[str, str], **overrides: str) -> dict[str, Any]:
    response = client.post("/api/users", json={**NEW_USER, **overrides}, headers=headers)
    assert response.status_code == 201, response.text
    body: dict[str, Any] = response.json()
    return body


def _sign_in(client: TestClient, email: str, password: str) -> Any:
    return client.post("/api/auth/sign-in", json={"email": email, "password": password})


def _bearer(client: TestClient, email: str, password: str) -> dict[str, str]:
    return {"Authorization": f"Bearer {_sign_in(client, email, password).json()['token']}"}


def test_admin_creates_an_account_that_can_sign_in(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    created = _create(client, admin_headers)

    assert created["email"] == "nova@nb-cg.me"  # stored lowercase
    assert (created["role"], created["isActive"]) == ("curator", True)
    assert "password" not in created
    assert "passwordHash" not in created
    signed_in = _sign_in(client, "nova@nb-cg.me", "tajna1234")
    assert signed_in.status_code == 200
    assert signed_in.json()["user"]["role"] == "curator"


def test_an_admin_can_create_another_admin(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    created = _create(client, admin_headers, role="admin")

    headers = _bearer(client, "nova@nb-cg.me", "tajna1234")
    assert created["role"] == "admin"
    assert client.get("/api/users", headers=headers).status_code == 200


def test_curator_cannot_create_or_change_accounts(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    assert client.post("/api/users", json=NEW_USER, headers=auth_headers).status_code == 403
    patch = client.patch("/api/users/1", json={"role": "admin"}, headers=auth_headers)
    assert patch.status_code == 403


def test_account_writes_without_a_token_are_401(client: TestClient) -> None:
    assert client.post("/api/users", json=NEW_USER).status_code == 401
    assert client.patch("/api/users/1", json={"name": "X"}).status_code == 401


def test_a_duplicate_email_is_409(client: TestClient, admin_headers: dict[str, str]) -> None:
    _create(client, admin_headers)

    response = client.post(
        "/api/users", json={**NEW_USER, "email": "nova@nb-cg.me"}, headers=admin_headers
    )

    assert response.status_code == 409
    assert response.json()["code"] == "email_already_registered"


def test_a_weak_password_or_unknown_role_is_422(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    response = client.post(
        "/api/users",
        json={**NEW_USER, "password": "kratka", "role": "visitor"},
        headers=admin_headers,
    )

    assert response.status_code == 422
    assert {"password", "role"} <= set(response.json()["fieldErrors"])


def test_changing_a_role_changes_the_rights(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    created = _create(client, admin_headers)
    headers = _bearer(client, "nova@nb-cg.me", "tajna1234")
    assert client.get("/api/users", headers=headers).status_code == 403

    changed = client.patch(
        f"/api/users/{created['id']}", json={"role": "admin"}, headers=admin_headers
    )

    assert changed.json()["role"] == "admin"
    assert client.get("/api/users", headers=headers).status_code == 200  # same token, new rights


def test_a_switched_off_account_is_locked_out_at_once(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    created = _create(client, admin_headers)
    headers = _bearer(client, "nova@nb-cg.me", "tajna1234")
    assert client.get("/api/auth/me", headers=headers).status_code == 200

    off = client.patch(
        f"/api/users/{created['id']}", json={"isActive": False}, headers=admin_headers
    )

    assert off.json()["isActive"] is False
    assert client.get("/api/auth/me", headers=headers).json()["code"] == "invalid_token"
    refused = _sign_in(client, "nova@nb-cg.me", "tajna1234")
    assert refused.status_code == 403
    assert refused.json()["code"] == "account_disabled"
    # a wrong password still says nothing about the account
    assert _sign_in(client, "nova@nb-cg.me", "pogresna").json()["code"] == "invalid_credentials"


def test_switching_an_account_back_on_lets_it_sign_in(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    created = _create(client, admin_headers)
    url = f"/api/users/{created['id']}"
    client.patch(url, json={"isActive": False}, headers=admin_headers)

    client.patch(url, json={"isActive": True}, headers=admin_headers)

    assert _sign_in(client, "nova@nb-cg.me", "tajna1234").status_code == 200


def test_a_new_password_replaces_the_old_one(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    created = _create(client, admin_headers)

    client.patch(
        f"/api/users/{created['id']}", json={"password": "novaLozinka1"}, headers=admin_headers
    )

    assert _sign_in(client, "nova@nb-cg.me", "tajna1234").status_code == 401
    assert _sign_in(client, "nova@nb-cg.me", "novaLozinka1").status_code == 200


def test_the_name_can_change_and_the_rest_stays(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    created = _create(client, admin_headers)

    changed = client.patch(
        f"/api/users/{created['id']}", json={"name": "Drugo Ime"}, headers=admin_headers
    )

    assert changed.json()["name"] == "Drugo Ime"
    assert changed.json()["role"] == "curator"


def test_an_admin_cannot_demote_or_switch_off_themselves(
    client: TestClient, admin_headers: dict[str, str]
) -> None:
    own_id = client.get("/api/auth/me", headers=admin_headers).json()["id"]

    demote = client.patch(f"/api/users/{own_id}", json={"role": "curator"}, headers=admin_headers)
    off = client.patch(f"/api/users/{own_id}", json={"isActive": False}, headers=admin_headers)

    assert demote.status_code == 403
    assert demote.json()["code"] == "cannot_change_own_access"
    assert off.status_code == 403
    # keeping the same role while changing the name is fine
    same = client.patch(
        f"/api/users/{own_id}", json={"role": "admin", "name": "Novo Ime"}, headers=admin_headers
    )
    assert same.status_code == 200


def test_unknown_account_is_404(client: TestClient, admin_headers: dict[str, str]) -> None:
    response = client.patch("/api/users/999", json={"name": "X"}, headers=admin_headers)

    assert response.status_code == 404
    assert response.json()["code"] == "user_not_found"

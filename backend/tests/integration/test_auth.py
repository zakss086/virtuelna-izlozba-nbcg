from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


@pytest.mark.usefixtures("auth_headers")
def test_sign_in_then_me(client: TestClient) -> None:
    response = client.post(
        "/api/auth/sign-in", json={"email": "Ana@NB-CG.me", "password": "secret123"}
    )

    assert response.status_code == 200
    body = response.json()
    assert body["user"]["email"] == "ana@nb-cg.me"
    assert body["user"]["role"] == "curator"
    assert "password" not in body["user"]
    assert "passwordHash" not in body["user"]

    me = client.get("/api/auth/me", headers={"Authorization": f"Bearer {body['token']}"})
    assert me.status_code == 200
    assert me.json()["name"] == "Ana"


@pytest.mark.usefixtures("auth_headers")
def test_sign_in_wrong_password_is_401(client: TestClient) -> None:
    response = client.post("/api/auth/sign-in", json={"email": "ana@nb-cg.me", "password": "nope"})

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid email or password", "code": "invalid_credentials"}


def test_sign_in_unknown_email_gives_the_same_401(client: TestClient) -> None:
    response = client.post(
        "/api/auth/sign-in", json={"email": "nobody@nb-cg.me", "password": "secret123"}
    )

    assert response.status_code == 401
    assert response.json()["code"] == "invalid_credentials"


def test_me_with_garbage_token_is_401(client: TestClient) -> None:
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer not-a-jwt"})

    assert response.status_code == 401
    assert response.json()["code"] == "invalid_token"


def test_me_without_token_is_401(client: TestClient) -> None:
    response = client.get("/api/auth/me")

    assert response.status_code == 401
    assert response.json()["code"] == "not_authenticated"

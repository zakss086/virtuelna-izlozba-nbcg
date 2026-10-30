"""API layer only: the auth service is a mock."""

from __future__ import annotations

from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from app.auth.exceptions.auth import InvalidCredentialsException
from app.auth.schemas.auth import AuthenticationResponseSchema
from app.users.schemas.user import UserResponseSchema
from tests.utils import create_current_user

pytestmark = pytest.mark.unit

LOGIN_BODY = {"email": "marko@nb-cg.me", "password": "demo1234"}


def test_sign_in_returns_token_and_user(client: TestClient, auth_service: Mock) -> None:
    user = create_current_user(1, "marko@nb-cg.me")
    auth_service.login.return_value = AuthenticationResponseSchema(
        token="jwt", user=UserResponseSchema.model_validate(user, from_attributes=True)
    )

    response = client.post("/api/auth/sign-in", json=LOGIN_BODY)

    assert response.status_code == 200
    assert response.json() == {
        "token": "jwt",
        "user": {
            "id": 1,
            "email": "marko@nb-cg.me",
            "name": "Test User",
            "role": "curator",
            "isActive": True,
            "createdAt": "2026-01-01T00:00:00Z",
        },
    }


def test_sign_in_wrong_password_is_401(client: TestClient, auth_service: Mock) -> None:
    auth_service.login.side_effect = InvalidCredentialsException()

    response = client.post("/api/auth/sign-in", json={**LOGIN_BODY, "password": "wrong"})

    assert response.status_code == 401
    assert response.json() == {"detail": "Invalid email or password", "code": "invalid_credentials"}
    assert response.headers["WWW-Authenticate"] == "Bearer"


def test_sign_in_invalid_email_is_422(client: TestClient, auth_service: Mock) -> None:
    response = client.post("/api/auth/sign-in", json={**LOGIN_BODY, "email": "not-an-email"})

    assert response.status_code == 422
    assert "email" in response.json()["fieldErrors"]
    auth_service.login.assert_not_called()


def test_me_returns_the_user_behind_the_token(client: TestClient) -> None:
    response = client.get("/api/auth/me", headers={"Authorization": "Bearer token"})

    assert response.status_code == 200
    assert response.json()["email"] == "test@example.com"
    assert response.json()["role"] == "curator"


def test_me_without_token_is_401(client: TestClient) -> None:
    response = client.get("/api/auth/me")

    assert response.status_code == 401
    assert response.json()["code"] == "not_authenticated"

"""API layer only: creating and changing staff accounts, the user service is a mock."""

from __future__ import annotations

from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from app.users.exceptions.user import (
    AdminOnlyException,
    CannotChangeOwnAccessException,
    EmailAlreadyRegisteredException,
    UserNotFoundException,
)
from app.users.schemas.user import UserResponseSchema
from tests.utils import create_current_user

pytestmark = pytest.mark.unit

AUTH = {"Authorization": "Bearer token"}
NEW_USER = {
    "email": "nova@nb-cg.me",
    "name": "Nova Osoba",
    "role": "curator",
    "password": "tajna1234",
}


def _user() -> UserResponseSchema:
    return UserResponseSchema.model_validate(
        create_current_user(2, "nova@nb-cg.me"), from_attributes=True
    )


def test_create_user_returns_201(client: TestClient, user_service: Mock) -> None:
    user_service.create.return_value = _user()

    response = client.post("/api/users", json=NEW_USER, headers=AUTH)

    assert response.status_code == 201
    assert response.json()["isActive"] is True  # camelCase
    assert "password" not in response.json()
    assert user_service.create.call_args.kwargs["data"].role == "curator"


def test_create_user_without_token_is_401(client: TestClient, user_service: Mock) -> None:
    assert client.post("/api/users", json=NEW_USER).status_code == 401
    user_service.create.assert_not_called()


def test_create_user_by_a_curator_is_403(client: TestClient, user_service: Mock) -> None:
    user_service.create.side_effect = AdminOnlyException()

    assert client.post("/api/users", json=NEW_USER, headers=AUTH).status_code == 403


def test_create_user_with_a_duplicate_email_is_409(client: TestClient, user_service: Mock) -> None:
    user_service.create.side_effect = EmailAlreadyRegisteredException()

    response = client.post("/api/users", json=NEW_USER, headers=AUTH)

    assert response.status_code == 409
    assert response.json()["fieldErrors"] == {"email": "Email is already registered"}


def test_create_user_validates_the_body(client: TestClient, user_service: Mock) -> None:
    bad = {"email": "nije-email", "name": "", "role": "visitor", "password": "kratka"}

    response = client.post("/api/users", json=bad, headers=AUTH)

    assert response.status_code == 422
    assert {"email", "name", "role", "password"} <= set(response.json()["fieldErrors"])
    user_service.create.assert_not_called()


def test_update_user_passes_only_given_fields(client: TestClient, user_service: Mock) -> None:
    user_service.update.return_value = _user()

    client.patch("/api/users/2", json={"isActive": False}, headers=AUTH)

    data = user_service.update.call_args.kwargs["data"]
    assert data.model_dump(exclude_unset=True) == {"is_active": False}


def test_update_own_role_is_403(client: TestClient, user_service: Mock) -> None:
    user_service.update.side_effect = CannotChangeOwnAccessException()

    response = client.patch("/api/users/1", json={"role": "curator"}, headers=AUTH)

    assert response.status_code == 403
    assert response.json()["code"] == "cannot_change_own_access"


def test_update_unknown_user_is_404(client: TestClient, user_service: Mock) -> None:
    user_service.update.side_effect = UserNotFoundException()

    assert client.patch("/api/users/9", json={"name": "X"}, headers=AUTH).status_code == 404


def test_update_user_without_token_is_401(client: TestClient) -> None:
    assert client.patch("/api/users/2", json={"name": "X"}).status_code == 401

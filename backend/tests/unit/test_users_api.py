"""API layer only: the user service is a mock."""

from __future__ import annotations

from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from app.users.exceptions.user import AdminOnlyException
from app.users.schemas.user import UserResponseSchema
from app.utils.pagination import Page
from tests.utils import create_current_user

pytestmark = pytest.mark.unit

AUTH = {"Authorization": "Bearer token"}


def test_list_users_returns_a_page(client: TestClient, user_service: Mock) -> None:
    user = UserResponseSchema.model_validate(create_current_user(1), from_attributes=True)
    user_service.list.return_value = Page(total=1, items=[user], pages=1)

    response = client.get("/api/users", headers=AUTH)

    assert response.status_code == 200
    assert response.json()["total"] == 1
    assert response.json()["items"][0]["createdAt"] == "2026-01-01T00:00:00Z"
    assert user_service.list.call_args.kwargs["current_user"].id == 1


def test_list_users_without_token_is_401(client: TestClient, user_service: Mock) -> None:
    response = client.get("/api/users")

    assert response.status_code == 401
    user_service.list.assert_not_called()


def test_list_users_by_a_curator_is_403(client: TestClient, user_service: Mock) -> None:
    user_service.list.side_effect = AdminOnlyException()

    response = client.get("/api/users", headers=AUTH)

    assert response.status_code == 403
    assert response.json() == {"detail": "Only an admin can do this", "code": "admin_only"}

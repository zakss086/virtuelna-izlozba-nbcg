from __future__ import annotations

import pytest
from fastapi.testclient import TestClient


def test_admin_lists_staff(client: TestClient, admin_headers: dict[str, str]) -> None:
    response = client.get("/api/users", headers=admin_headers)

    assert response.status_code == 200
    body = response.json()
    assert body["total"] == 1
    assert body["items"][0]["role"] == "admin"
    assert "passwordHash" not in body["items"][0]


def test_curator_cannot_list_staff(client: TestClient, auth_headers: dict[str, str]) -> None:
    response = client.get("/api/users", headers=auth_headers)

    assert response.status_code == 403
    assert response.json()["code"] == "admin_only"


def test_list_staff_without_token_is_401(client: TestClient) -> None:
    assert client.get("/api/users").status_code == 401


@pytest.mark.usefixtures("auth_headers", "other_auth_headers")
def test_staff_list_is_paginated(client: TestClient, admin_headers: dict[str, str]) -> None:
    response = client.get("/api/users?size=2&page=2", headers=admin_headers)

    assert response.status_code == 200
    body = response.json()
    assert (body["total"], body["pages"], len(body["items"])) == (3, 2, 1)

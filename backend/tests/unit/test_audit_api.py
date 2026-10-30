"""API layer only: the history of changes, the audit service is a mock."""

from __future__ import annotations

from datetime import UTC, datetime
from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

from app.audit.models.audit import AuditAction, AuditEntityType
from app.audit.schemas.audit import AuditEntryResponseSchema
from app.users.exceptions.user import AdminOnlyException
from app.utils.pagination import Page

pytestmark = pytest.mark.unit

AUTH = {"Authorization": "Bearer token"}


def _page() -> Page[AuditEntryResponseSchema]:
    entry = AuditEntryResponseSchema(
        id=1,
        created_at=datetime(2026, 1, 1, tzinfo=UTC),
        actor_id=1,
        actor_name="Test User",
        action=AuditAction.UPDATE,
        entity_type=AuditEntityType.COLLECTION,
        entity_ref="4",
        label="Rukopisi",
        detail="position",
    )
    return Page(total=1, items=[entry], pages=1)


def test_list_returns_a_page_in_camel_case(client: TestClient, audit_service: Mock) -> None:
    audit_service.list.return_value = _page()

    response = client.get("/api/audit", headers=AUTH)

    assert response.status_code == 200
    item = response.json()["items"][0]
    assert item["createdAt"] == "2026-01-01T00:00:00Z"
    assert item["entityType"] == "collection"
    assert item["actorName"] == "Test User"


def test_list_passes_the_filter_and_the_user(client: TestClient, audit_service: Mock) -> None:
    audit_service.list.return_value = _page()

    client.get("/api/audit?entityType=library&page=2&size=10", headers=AUTH)

    kwargs = audit_service.list.call_args.kwargs
    assert kwargs["entity_type"] == AuditEntityType.LIBRARY
    assert (kwargs["pagination_params"].page, kwargs["pagination_params"].size) == (2, 10)
    assert kwargs["current_user"].id == 1


def test_list_by_a_curator_is_403(client: TestClient, audit_service: Mock) -> None:
    audit_service.list.side_effect = AdminOnlyException()

    assert client.get("/api/audit", headers=AUTH).status_code == 403


def test_list_without_a_token_is_401(client: TestClient, audit_service: Mock) -> None:
    assert client.get("/api/audit").status_code == 401
    audit_service.list.assert_not_called()


def test_list_rejects_an_unknown_kind(client: TestClient, audit_service: Mock) -> None:
    response = client.get("/api/audit?entityType=cookie", headers=AUTH)

    assert response.status_code == 422
    audit_service.list.assert_not_called()

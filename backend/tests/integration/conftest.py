"""Integration tests run against a real database: a temporary SQLite file, created once per package.

Set DATABASE_URL to a separate Postgres database whose name contains "test" (see backend/README.md) to run the same tests on it.
"""

from __future__ import annotations

import os
from collections.abc import Callable, Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import delete

from app.audit.models.audit import AuditEntry
from app.auth.password import hash_password
from app.collections.models.collection import Collection
from app.config.settings import DBSettings, Settings
from app.content.models.content import ContentBlock
from app.database.base import Base
from app.database.session_factory import ISessionFactory, SessionFactory
from app.exhibitions.models.exhibition import Exhibition
from app.libraries.models.library import Library
from app.media.models.media import MediaAsset
from app.users.models.user import User, UserRole
from app.utils.di import add_to_di_container, get_from_di_container
from tests.utils import exhibition_body

pytestmark = pytest.mark.integration

PASSWORD = "secret123"


@pytest.fixture(scope="package")
def setup_db(tmp_path_factory: pytest.TempPathFactory) -> Generator[None]:
    previous_settings = get_from_di_container(Settings)
    previous_session_factory = get_from_di_container(ISessionFactory)

    database_url = os.environ.get("DATABASE_URL")
    # The tests create and drop every table, so a real database must be a separate one made for them.
    if database_url and not database_url.startswith("sqlite") and "test" not in database_url:
        pytest.exit(
            "Integration tests drop all tables: point DATABASE_URL at a database whose name "
            "contains 'test' (e.g. postgresql+psycopg://app:app@localhost:5432/app_test).",
            returncode=2,
        )
    if not database_url:
        db_file: Path = tmp_path_factory.mktemp("db") / "test.db"
        database_url = f"sqlite:///{db_file}"

    new_settings = previous_settings.model_copy(update={"DATABASE_URL": database_url})
    add_to_di_container(Settings, new_settings)
    add_to_di_container(DBSettings, new_settings)
    add_to_di_container(ISessionFactory, SessionFactory(new_settings))

    yield

    add_to_di_container(Settings, previous_settings)
    add_to_di_container(DBSettings, previous_settings)
    add_to_di_container(ISessionFactory, previous_session_factory)


@pytest.fixture(scope="package", autouse=True)
def tables(setup_db: None) -> Generator[None]:  # noqa: ARG001
    session_factory = get_from_di_container(ISessionFactory)

    # Tests build the schema from the models; the app itself only ever uses migrations (ADR-004).
    Base.metadata.create_all(bind=session_factory.engine)

    yield

    Base.metadata.drop_all(bind=session_factory.engine)


@pytest.fixture(autouse=True)
def clean_tables() -> Generator[None]:
    """Every test starts from empty tables, so tests cannot depend on each other's rows."""
    yield
    session_factory = get_from_di_container(ISessionFactory)
    with session_factory() as session:
        session.execute(delete(AuditEntry))
        session.execute(delete(Collection))
        session.execute(delete(Library))
        session.execute(delete(MediaAsset))
        session.execute(delete(ContentBlock))
        session.execute(delete(Exhibition))
        session.execute(delete(User))
        session.commit()


@pytest.fixture
def sign_in(client: TestClient) -> Callable[[str, UserRole], dict[str, str]]:
    """Creates a staff account and signs it in. Accounts have no API (an admin adds them in the
    database), so this is the one place where a row is inserted directly."""

    def _sign_in(email: str, role: UserRole = UserRole.CURATOR) -> dict[str, str]:
        session_factory = get_from_di_container(ISessionFactory)
        with session_factory() as session:
            session.add(
                User(
                    email=email,
                    password_hash=hash_password(PASSWORD),
                    name=email.split("@")[0].title(),
                    role=role,
                )
            )
            session.commit()
        response = client.post("/api/auth/sign-in", json={"email": email, "password": PASSWORD})
        assert response.status_code == 200, response.text
        return {"Authorization": f"Bearer {response.json()['token']}"}

    return _sign_in


@pytest.fixture
def auth_headers(sign_in: Callable[[str, UserRole], dict[str, str]]) -> dict[str, str]:
    return sign_in("ana@nb-cg.me", UserRole.CURATOR)


@pytest.fixture
def other_auth_headers(sign_in: Callable[[str, UserRole], dict[str, str]]) -> dict[str, str]:
    return sign_in("marko@nb-cg.me", UserRole.CURATOR)


@pytest.fixture
def admin_headers(sign_in: Callable[[str, UserRole], dict[str, str]]) -> dict[str, str]:
    return sign_in("jelena@nb-cg.me", UserRole.ADMIN)


@pytest.fixture
def exhibition_id(client: TestClient, auth_headers: dict[str, str]) -> int:
    """A draft exhibition by `auth_headers` (ana)."""
    response = client.post("/api/exhibitions", json=exhibition_body(), headers=auth_headers)
    assert response.status_code == 201, response.text
    return int(response.json()["id"])

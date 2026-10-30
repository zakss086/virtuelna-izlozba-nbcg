from __future__ import annotations

import tempfile
from collections.abc import Generator

import pytest
from fastapi import FastAPI
from fastapi.testclient import TestClient

from app.app import setup_app
from app.config.settings import DBSettings, Settings
from app.utils.di import add_to_di_container
from tests.utils import TestSettings

# Uploaded files of the tests go to a temporary folder, with a 1 MB limit so the "too large" case is cheap.
settings = TestSettings(
    JWT_SECRET_KEY="test_secret_key_with_at_least_32_bytes!",
    DATABASE_URL="sqlite://",
    MEDIA_DIR=tempfile.mkdtemp(prefix="nbcg-media-test-"),
    MAX_UPLOAD_MB=1,
)
add_to_di_container(Settings, settings)
add_to_di_container(DBSettings, settings)


@pytest.fixture(scope="session")  # only setup app once
def app() -> FastAPI:
    return setup_app()


@pytest.fixture
def client(app: FastAPI) -> Generator[TestClient]:
    with TestClient(app) as c:
        yield c

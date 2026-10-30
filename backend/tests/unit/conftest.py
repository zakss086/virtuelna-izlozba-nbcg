from __future__ import annotations

from collections.abc import Generator
from unittest.mock import Mock, create_autospec

import pytest

from app.auth.services.auth import IAuthService
from app.content.services.content import IContentService
from app.database.session_factory import ISessionFactory
from app.exhibitions.services.exhibition import IExhibitionService
from app.media.services.media import IMediaService
from app.users.services.user import IUserService
from app.utils.di import add_to_di_container, get_from_di_container, remove_from_di_container
from tests.unit.utils import MockSessionFactory
from tests.utils import create_current_user


@pytest.fixture(scope="package", autouse=True)
def session_factory() -> Generator[None]:
    previous_session_factory = get_from_di_container(ISessionFactory)
    add_to_di_container(ISessionFactory, MockSessionFactory())
    yield
    add_to_di_container(ISessionFactory, previous_session_factory)


@pytest.fixture(autouse=True)
def auth_service() -> Generator[Mock]:
    """Every request is authenticated as curator 1 by default; a test can change the return value."""
    mock_service = create_autospec(IAuthService, instance=True)
    mock_service.get_current_user.return_value = create_current_user(1)
    add_to_di_container(IAuthService, mock_service)
    yield mock_service
    # removing the override restores the original service because it is a "factory"
    remove_from_di_container(IAuthService)


@pytest.fixture
def exhibition_service() -> Generator[Mock]:
    mock_service = create_autospec(IExhibitionService, instance=True)
    add_to_di_container(IExhibitionService, mock_service)
    yield mock_service
    remove_from_di_container(IExhibitionService)


@pytest.fixture
def content_service() -> Generator[Mock]:
    mock_service = create_autospec(IContentService, instance=True)
    add_to_di_container(IContentService, mock_service)
    yield mock_service
    remove_from_di_container(IContentService)


@pytest.fixture
def media_service() -> Generator[Mock]:
    mock_service = create_autospec(IMediaService, instance=True)
    add_to_di_container(IMediaService, mock_service)
    yield mock_service
    remove_from_di_container(IMediaService)


@pytest.fixture
def user_service() -> Generator[Mock]:
    mock_service = create_autospec(IUserService, instance=True)
    add_to_di_container(IUserService, mock_service)
    yield mock_service
    remove_from_di_container(IUserService)

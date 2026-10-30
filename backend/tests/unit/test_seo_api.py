"""API layer only: crawler pages, the SEO service is a mock."""

from __future__ import annotations

from unittest.mock import Mock

import pytest
from fastapi.testclient import TestClient

pytestmark = pytest.mark.unit


def test_exhibition_page_is_html(client: TestClient, seo_service: Mock) -> None:
    seo_service.exhibition_page.return_value = "<html><head></head></html>"

    response = client.get("/exhibitions/crna-gora-u-krugu")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/html")
    seo_service.exhibition_page.assert_called_once_with("crna-gora-u-krugu")


def test_unknown_exhibition_page_is_404(client: TestClient, seo_service: Mock) -> None:
    seo_service.exhibition_page.return_value = None

    assert client.get("/exhibitions/nema").status_code == 404


def test_sitemap_is_xml(client: TestClient, seo_service: Mock) -> None:
    seo_service.sitemap.return_value = "<urlset></urlset>"

    response = client.get("/sitemap.xml")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/xml")


def test_robots_is_plain_text(client: TestClient, seo_service: Mock) -> None:
    seo_service.robots.return_value = "User-agent: *\n"

    response = client.get("/robots.txt")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/plain")

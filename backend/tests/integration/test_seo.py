from __future__ import annotations

from collections.abc import Generator
from pathlib import Path

import pytest
from fastapi.testclient import TestClient

from app.config.settings import Settings
from app.utils.di import add_to_di_container, get_from_di_container
from tests.utils import exhibition_body, localized

INDEX = (
    '<!doctype html><html lang="me"><head><title>Virtuelne izložbe | NBCG</title></head>'
    '<body><div id="root"></div></body></html>'
)
BASE = "https://izlozbe.example.me"


@pytest.fixture
def site(tmp_path: Path) -> Generator[Path]:
    """A built frontend folder with a tiny index.html, and the public address of the site."""
    (tmp_path / "index.html").write_text(INDEX, encoding="utf-8")
    previous = get_from_di_container(Settings)
    add_to_di_container(
        Settings,
        previous.model_copy(update={"FRONTEND_DIST_DIR": str(tmp_path), "PUBLIC_BASE_URL": BASE}),
    )
    yield tmp_path
    add_to_di_container(Settings, previous)


def _published(client: TestClient, headers: dict[str, str], **overrides: object) -> dict[str, str]:
    body = exhibition_body(status="published", **overrides)
    response = client.post("/api/exhibitions", json=body, headers=headers)
    assert response.status_code == 201, response.text
    created: dict[str, str] = response.json()
    return created


def test_exhibition_page_has_the_share_tags(
    client: TestClient, admin_headers: dict[str, str], site: Path  # noqa: ARG001
) -> None:
    created = _published(client, admin_headers)

    response = client.get(f"/exhibitions/{created['slug']}")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("text/html")
    page = response.text
    assert (
        "<title>Nova izložba | Virtuelne izložbe | Nacionalna biblioteka Crne Gore</title>" in page
    )
    assert 'property="og:title" content="Nova izložba"' in page
    assert f'rel="canonical" href="{BASE}/exhibitions/{created["slug"]}"' in page
    assert 'property="og:image" content="https://example.com/cover.jpg"' in page
    assert '"@type": "CreativeWork"' in page
    assert '<div id="root"></div>' in page  # the app itself is untouched


def test_text_from_an_exhibition_cannot_break_out_of_the_tags(
    client: TestClient, admin_headers: dict[str, str], site: Path  # noqa: ARG001
) -> None:
    evil = localized('Tri "navodnika" </script><b>x</b>', "Three quotes")
    created = _published(client, admin_headers, title=evil, summary=evil)

    page = client.get(f"/exhibitions/{created['slug']}").text

    assert "</script><b>" not in page
    assert "<b>x</b>" not in page
    assert "&lt;/script&gt;" in page or "\\u003c/script" in page
    assert page.count("</script>") == 1  # only the one that closes the JSON-LD block


def test_a_draft_and_an_unknown_exhibition_answer_404(
    client: TestClient, auth_headers: dict[str, str], site: Path  # noqa: ARG001
) -> None:
    draft = client.post("/api/exhibitions", json=exhibition_body(), headers=auth_headers).json()

    assert client.get(f"/exhibitions/{draft['slug']}").status_code == 404
    assert client.get("/exhibitions/nema-takve").status_code == 404


def test_without_a_built_frontend_the_page_is_404(
    client: TestClient, admin_headers: dict[str, str], site: Path
) -> None:
    created = _published(client, admin_headers)
    (site / "index.html").unlink()

    assert client.get(f"/exhibitions/{created['slug']}").status_code == 404


def test_sitemap_lists_published_exhibitions_only(
    client: TestClient,
    admin_headers: dict[str, str],
    auth_headers: dict[str, str],
    site: Path,  # noqa: ARG001
) -> None:
    published = _published(client, admin_headers)
    draft = client.post("/api/exhibitions", json=exhibition_body(), headers=auth_headers).json()

    response = client.get("/sitemap.xml")

    assert response.status_code == 200
    assert response.headers["content-type"].startswith("application/xml")
    assert f"<loc>{BASE}/exhibitions/{published['slug']}</loc>" in response.text
    assert draft["slug"] not in response.text
    assert f"<loc>{BASE}/about</loc>" in response.text


def test_robots_keeps_staff_pages_out_and_points_to_the_sitemap(
    client: TestClient, site: Path  # noqa: ARG001
) -> None:
    text = client.get("/robots.txt").text

    assert "Disallow: /admin" in text
    assert "Disallow: /studio" in text
    assert f"Sitemap: {BASE}/sitemap.xml" in text

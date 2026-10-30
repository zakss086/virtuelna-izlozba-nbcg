from __future__ import annotations

from pathlib import Path

from fastapi.testclient import TestClient

from app.config.settings import Settings
from app.utils.di import get_from_di_container

PNG = b"\x89PNG\r\n\x1a\n" + b"\x00" * 64
JPEG = b"\xff\xd8\xff\xe0" + b"\x00" * 64
MP4 = b"\x00\x00\x00\x18ftypmp42" + b"\x00" * 64
FORM = {"credit": "Wikimedia Commons", "license": "CC BY-SA 4.0"}


def _upload(
    client: TestClient,
    headers: dict[str, str],
    data: bytes = PNG,
    name: str = "kotor.png",
    form: dict[str, str] | None = None,
) -> dict[str, object]:
    response = client.post(
        "/api/media", data=form or FORM, files={"file": (name, data)}, headers=headers
    )
    assert response.status_code == 201, response.text
    body: dict[str, object] = response.json()
    return body


def _media_dir() -> Path:
    return Path(get_from_di_container(Settings).MEDIA_DIR)


def test_upload_stores_the_file_and_serves_it_publicly(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    asset = _upload(client, auth_headers, form={**FORM, "sourceUrl": "https://example.com/k"})

    assert asset["contentType"] == "image/png"
    assert asset["filename"] == "kotor.png"
    assert asset["credit"] == "Wikimedia Commons"
    assert asset["sourceUrl"] == "https://example.com/k"
    url = str(asset["url"])
    assert url.startswith("/media/")
    assert url.endswith(".png")
    assert (_media_dir() / url.removeprefix("/media/")).read_bytes() == PNG

    served = client.get(url)  # no token: visitors see pictures in exhibitions
    assert served.status_code == 200
    assert served.headers["content-type"] == "image/png"
    assert served.content == PNG


def test_the_type_comes_from_the_content_not_the_name(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    asset = _upload(client, auth_headers, data=JPEG, name="picture.png")

    assert asset["contentType"] == "image/jpeg"
    assert str(asset["url"]).endswith(".jpg")


def test_a_video_is_accepted(client: TestClient, auth_headers: dict[str, str]) -> None:
    asset = _upload(client, auth_headers, data=MP4, name="clip.mp4")

    assert asset["contentType"] == "video/mp4"


def test_a_file_that_is_not_media_is_refused(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    before = len(list(_media_dir().iterdir()))

    response = client.post(
        "/api/media",
        data=FORM,
        files={"file": ("evil.png", b"<script>alert(1)</script>")},
        headers=auth_headers,
    )

    assert response.status_code == 400
    assert response.json()["code"] == "unsupported_media_type"
    assert len(list(_media_dir().iterdir())) == before  # nothing was written


def test_svg_is_refused(client: TestClient, auth_headers: dict[str, str]) -> None:
    svg = b'<svg xmlns="http://www.w3.org/2000/svg"><script>alert(1)</script></svg>'

    response = client.post(
        "/api/media",
        data=FORM,
        files={"file": ("a.svg", svg, "image/svg+xml")},
        headers=auth_headers,
    )

    assert response.status_code == 400


def test_a_file_over_the_limit_is_refused(client: TestClient, auth_headers: dict[str, str]) -> None:
    too_large = PNG + b"\x00" * (1024 * 1024)  # the tests allow 1 MB

    response = client.post(
        "/api/media", data=FORM, files={"file": ("big.png", too_large)}, headers=auth_headers
    )

    assert response.status_code == 400
    assert response.json()["code"] == "file_too_large"


def test_upload_without_token_is_401(client: TestClient) -> None:
    response = client.post("/api/media", data=FORM, files={"file": ("kotor.png", PNG)})

    assert response.status_code == 401


def test_credit_and_license_are_required(client: TestClient, auth_headers: dict[str, str]) -> None:
    response = client.post(
        "/api/media", data={"credit": " "}, files={"file": ("kotor.png", PNG)}, headers=auth_headers
    )

    assert response.status_code == 422
    assert "license" in response.json()["fieldErrors"]


def test_a_curator_lists_their_files_and_an_admin_all(
    client: TestClient,
    auth_headers: dict[str, str],
    other_auth_headers: dict[str, str],
    admin_headers: dict[str, str],
) -> None:
    _upload(client, auth_headers)
    _upload(client, other_auth_headers, data=JPEG, name="b.jpg")

    assert client.get("/api/media", headers=auth_headers).json()["total"] == 1
    assert client.get("/api/media", headers=other_auth_headers).json()["total"] == 1
    assert client.get("/api/media", headers=admin_headers).json()["total"] == 2
    assert client.get("/api/media").status_code == 401


def test_delete_removes_the_record_and_the_file(
    client: TestClient, auth_headers: dict[str, str]
) -> None:
    asset = _upload(client, auth_headers)
    path = _media_dir() / str(asset["url"]).removeprefix("/media/")
    assert path.exists()

    response = client.delete(f"/api/media/{asset['id']}", headers=auth_headers)

    assert response.status_code == 204
    assert not path.exists()
    assert client.get("/api/media", headers=auth_headers).json()["total"] == 0
    assert client.delete(f"/api/media/{asset['id']}", headers=auth_headers).status_code == 404


def test_delete_by_another_curator_is_403_and_by_an_admin_is_ok(
    client: TestClient,
    auth_headers: dict[str, str],
    other_auth_headers: dict[str, str],
    admin_headers: dict[str, str],
) -> None:
    asset = _upload(client, auth_headers)
    url = f"/api/media/{asset['id']}"

    forbidden = client.delete(url, headers=other_auth_headers)

    assert forbidden.status_code == 403
    assert forbidden.json()["code"] == "not_media_owner"
    assert client.delete(url, headers=admin_headers).status_code == 204


def test_delete_without_token_is_401(client: TestClient) -> None:
    assert client.delete("/api/media/1").status_code == 401

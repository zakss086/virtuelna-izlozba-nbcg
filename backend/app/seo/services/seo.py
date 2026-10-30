from __future__ import annotations

import html
import json
import re
from pathlib import Path
from typing import Protocol
from urllib.parse import quote
from xml.sax.saxutils import escape as xml_escape

from app.config.settings import Settings
from app.exhibitions.exceptions.exhibition import ExhibitionNotFoundException
from app.exhibitions.schemas.exhibition import ExhibitionResponseSchema
from app.exhibitions.services.exhibition import IExhibitionService
from app.utils.di import inject
from app.utils.pagination import PaginationParams

SITE_NAME = "Virtuelne izložbe | Nacionalna biblioteka Crne Gore"
PUBLISHER = "Nacionalna biblioteka Crne Gore „Đurđe Crnojević“"
_STATIC_PAGES = ["/", "/exhibitions", "/collections", "/map", "/videos", "/about"]
_DESCRIPTION_MAX = 200
_TITLE_TAG = re.compile(r"<title>.*?</title>", re.DOTALL)


class ISeoService(Protocol):
    def exhibition_page(self, slug: str) -> str | None: ...

    def sitemap(self) -> str: ...

    def robots(self) -> str: ...


def _shorten(text: str, limit: int = _DESCRIPTION_MAX) -> str:
    text = " ".join(text.split())
    return text if len(text) <= limit else text[: limit - 1].rstrip() + "…"


def _json_ld(data: dict[str, object]) -> str:
    # `<` is escaped so that text from an exhibition can never close the <script> element.
    return json.dumps(data, ensure_ascii=False).replace("<", "\\u003c")


@inject(alias=ISeoService)
class SeoService(ISeoService):
    """What search engines and link previews (Facebook, Viber, LinkedIn) need to see without running JavaScript.

    The app is a single-page app, so the server answers an exhibition's address with the built `index.html`
    plus the exhibition's title, description, picture and structured data in the <head>. The page itself then
    loads as usual.
    """

    def __init__(self, exhibition_service: IExhibitionService, settings: Settings) -> None:
        self._exhibition_service = exhibition_service
        self._base = settings.PUBLIC_BASE_URL.rstrip("/")
        self._index_file = Path(settings.FRONTEND_DIST_DIR) / "index.html"

    def exhibition_page(self, slug: str) -> str | None:
        try:
            exhibition = self._exhibition_service.get(slug_or_id=slug, current_user=None)
        except ExhibitionNotFoundException:
            return None
        if not self._index_file.is_file():
            return None
        index = self._index_file.read_text(encoding="utf-8")
        return self._inject(index, exhibition)

    def sitemap(self) -> str:
        urls = [f"{self._base}{path}" for path in _STATIC_PAGES]
        page = self._exhibition_service.list(
            current_user=None,
            search="",
            template=None,
            status=None,
            author_id=None,
            ids=[],
            pagination_params=PaginationParams(page=1, size=500),
        )
        urls += [f"{self._base}/exhibitions/{quote(e.slug)}" for e in page.items]
        entries = "".join(f"<url><loc>{xml_escape(url)}</loc></url>" for url in urls)
        return (
            '<?xml version="1.0" encoding="UTF-8"?>'
            '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'
            f"{entries}</urlset>"
        )

    def robots(self) -> str:
        return (
            "User-agent: *\n"
            "Allow: /\n"
            "Disallow: /admin\n"
            "Disallow: /studio\n"
            "Disallow: /profile\n"
            "Disallow: /sign-in\n"
            f"Sitemap: {self._base}/sitemap.xml\n"
        )

    def _absolute(self, url: str) -> str | None:
        if url.startswith(("http://", "https://")):
            return url
        if url.startswith("/"):
            return f"{self._base}{url}"
        return None  # a generated data: picture cannot be shown in a preview

    def _inject(self, index: str, exhibition: ExhibitionResponseSchema) -> str:
        title = f"{exhibition.title.me} | {SITE_NAME}"
        description = _shorten(exhibition.summary.me)
        page_url = f"{self._base}/exhibitions/{quote(exhibition.slug)}"
        image = self._absolute(exhibition.cover_url)

        data: dict[str, object] = {
            "@context": "https://schema.org",
            "@type": "CreativeWork",
            "name": exhibition.title.me,
            "alternateName": exhibition.title.en,
            "description": description,
            "url": page_url,
            "inLanguage": ["sr-Latn-ME", "en"],
            "author": {"@type": "Person", "name": exhibition.author_name},
            "publisher": {"@type": "Organization", "name": PUBLISHER, "url": "https://nb-cg.me"},
            "datePublished": exhibition.created_at.isoformat(),
            "keywords": ", ".join(exhibition.tags),
        }
        if image:
            data["image"] = image

        def meta(attr: str, name: str, content: str) -> str:
            return f'<meta {attr}="{name}" content="{html.escape(content, quote=True)}" />'

        tags = [
            meta("name", "description", description),
            f'<link rel="canonical" href="{html.escape(page_url, quote=True)}" />',
            meta("property", "og:type", "article"),
            meta("property", "og:site_name", SITE_NAME),
            meta("property", "og:title", exhibition.title.me),
            meta("property", "og:description", description),
            meta("property", "og:url", page_url),
            meta("property", "og:locale", "sr_ME"),
            meta("property", "og:locale:alternate", "en_GB"),
            meta("name", "twitter:card", "summary_large_image" if image else "summary"),
            meta("name", "twitter:title", exhibition.title.me),
            meta("name", "twitter:description", description),
        ]
        if image:
            tags += [meta("property", "og:image", image), meta("name", "twitter:image", image)]
        tags.append(f'<script type="application/ld+json">{_json_ld(data)}</script>')

        page = _TITLE_TAG.sub(lambda _m: f"<title>{html.escape(title)}</title>", index, count=1)
        return page.replace("</head>", "    " + "\n    ".join(tags) + "\n  </head>", 1)

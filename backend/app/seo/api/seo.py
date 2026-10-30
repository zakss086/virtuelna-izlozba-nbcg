from __future__ import annotations

from typing import Annotated

from fastapi import Depends, Path, Response
from fastapi.responses import HTMLResponse, PlainTextResponse

from app.database.session_handler import DBAPIRouter
from app.deps import get_di_entity
from app.seo.services.seo import ISeoService

router = DBAPIRouter()


@router.get(
    path="/exhibitions/{slug}",
    response_class=HTMLResponse,
    summary="An exhibition's page with title, picture and structured data in the head",
    description=(
        "For search engines and link previews. The reverse proxy sends `/exhibitions/*` here; the answer is the "
        "built `index.html`, so people get the normal app. Unknown and unpublished exhibitions answer 404."
    ),
)
def get_exhibition_page(
    slug: Annotated[str, Path(max_length=200)],
    seo_service: Annotated[ISeoService, Depends(get_di_entity(ISeoService))],
) -> Response:
    page = seo_service.exhibition_page(slug)
    if page is None:
        return PlainTextResponse("Not found", status_code=404)
    return HTMLResponse(page)


@router.get(path="/sitemap.xml", summary="Sitemap of the public pages")
def get_sitemap(
    seo_service: Annotated[ISeoService, Depends(get_di_entity(ISeoService))],
) -> Response:
    return Response(seo_service.sitemap(), media_type="application/xml")


@router.get(path="/robots.txt", summary="Rules for crawlers")
def get_robots(
    seo_service: Annotated[ISeoService, Depends(get_di_entity(ISeoService))],
) -> PlainTextResponse:
    return PlainTextResponse(seo_service.robots())

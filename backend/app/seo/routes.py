from __future__ import annotations

from fastapi import APIRouter

from app.seo.api.seo import router as seo_router

# Not under /api: these are public pages for crawlers, served at the site's own addresses.
router = APIRouter(tags=["SEO"])

router.include_router(seo_router)

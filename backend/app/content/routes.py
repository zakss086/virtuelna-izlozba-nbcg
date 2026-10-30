from __future__ import annotations

from fastapi import APIRouter

from app.content.api.content import router as content_router

router = APIRouter(tags=["Content"])

router.include_router(content_router)

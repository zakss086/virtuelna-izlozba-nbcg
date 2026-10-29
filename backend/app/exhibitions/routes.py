from __future__ import annotations

from fastapi import APIRouter

from app.exhibitions.api.exhibition import router as exhibition_router

router = APIRouter(tags=["Exhibitions"])

router.include_router(exhibition_router)

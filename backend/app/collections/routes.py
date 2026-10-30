from __future__ import annotations

from fastapi import APIRouter

from app.collections.api.collection import router as collection_router

router = APIRouter(tags=["Collections"])

router.include_router(collection_router)

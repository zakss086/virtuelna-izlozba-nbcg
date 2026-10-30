from __future__ import annotations

from fastapi import APIRouter

from app.libraries.api.library import router as library_router

router = APIRouter(tags=["Libraries"])

router.include_router(library_router)

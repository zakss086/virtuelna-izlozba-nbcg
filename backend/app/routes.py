from __future__ import annotations

from fastapi import APIRouter

from app.auth.routes import router as auth_router
from app.content.routes import router as content_router
from app.exhibitions.routes import router as exhibitions_router
from app.users.routes import router as users_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(exhibitions_router)
api_router.include_router(content_router)

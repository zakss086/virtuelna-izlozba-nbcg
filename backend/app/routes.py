from __future__ import annotations

from fastapi import APIRouter

from app.audit.routes import router as audit_router
from app.auth.routes import router as auth_router
from app.collections.routes import router as collections_router
from app.content.routes import router as content_router
from app.exhibitions.routes import router as exhibitions_router
from app.libraries.routes import router as libraries_router
from app.media.routes import router as media_router
from app.users.routes import router as users_router

api_router = APIRouter(prefix="/api")

api_router.include_router(auth_router)
api_router.include_router(users_router)
api_router.include_router(exhibitions_router)
api_router.include_router(media_router)
api_router.include_router(content_router)
api_router.include_router(libraries_router)
api_router.include_router(collections_router)
api_router.include_router(audit_router)

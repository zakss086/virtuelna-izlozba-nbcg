from __future__ import annotations

from fastapi import APIRouter

from app.audit.api.audit import router as audit_router

router = APIRouter(tags=["Audit"])

router.include_router(audit_router)

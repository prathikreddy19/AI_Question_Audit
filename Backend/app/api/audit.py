"""Read-only audit log endpoints."""

from typing import Optional

from fastapi import APIRouter, Depends, Query
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.database import get_database
from app.services.audit_log_service import AuditLogService

router = APIRouter(prefix="/audit", tags=["Audit Logs"])


@router.get("/logs")
async def get_audit_logs(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=500),
    event_type: Optional[str] = Query(default=None, max_length=80),
    action: Optional[str] = Query(default=None, max_length=120),
    faculty_email: Optional[str] = Query(default=None, max_length=254),
    db: AsyncIOMotorDatabase = Depends(get_database),
):
    """Return newest-first audit events with optional filters and pagination."""
    return await AuditLogService(db).get_logs(
        page=page,
        limit=limit,
        event_type=event_type,
        action=action,
        faculty_email=faculty_email,
    )

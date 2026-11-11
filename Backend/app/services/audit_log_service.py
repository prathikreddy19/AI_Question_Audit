"""Best-effort append-only writes and paginated reads for audit events."""

import logging
import re
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from bson import ObjectId
from fastapi import HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.models.audit_log import AuditLog

logger = logging.getLogger(__name__)

EVENT_FILTERS = {
    "approved": ("question_approved", "ai_suggestion_applied", "manual_edit"),
    "rejected": ("question_rejected", "ai_suggestion_ignored"),
    "auto_applied": ("auto_applied",),
    "reports": ("student_report_created",),
}


def _json_safe(value: Any) -> Any:
    if isinstance(value, ObjectId):
        return str(value)
    if isinstance(value, datetime):
        return value.astimezone(timezone.utc).isoformat()
    if isinstance(value, dict):
        return {str(key): _json_safe(item) for key, item in value.items() if key != "_id"}
    if isinstance(value, (list, tuple)):
        return [_json_safe(item) for item in value]
    return value


class AuditLogService:
    """Append audit documents and retrieve them newest-first."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.collection = db.audit_logs

    async def record_event(
        self,
        *,
        event_type: str,
        question_id: str,
        action: str,
        faculty_email: Optional[str] = None,
        previous_value: Any = None,
        new_value: Any = None,
        report_id: Optional[str] = None,
        ai_suggestion_id: Optional[str] = None,
    ) -> None:
        """Insert one event. Audit failures are logged and never fail the caller."""
        event = AuditLog(
            event_type=event_type,
            question_id=question_id,
            faculty_email=faculty_email,
            action=action,
            previous_value=_json_safe(previous_value),
            new_value=_json_safe(new_value),
            timestamp=datetime.now(timezone.utc).isoformat(),
            report_id=report_id,
            ai_suggestion_id=ai_suggestion_id,
        ).to_dict()
        try:
            await self.collection.insert_one(event)
        except Exception:
            logger.exception(
                "Audit log insert failed event_type=%s report_id=%s question_id=%s",
                event_type,
                report_id,
                question_id,
            )

    @staticmethod
    def _legacy_action_regex(event_type: str) -> Optional[str]:
        patterns = {
            "approved": r"approve|applied|edit",
            "rejected": r"reject|ignor",
            "auto_applied": r"auto",
            "reports": r"report|submi",
        }
        return patterns.get(event_type)

    @staticmethod
    def _normalize_legacy(document: Dict[str, Any]) -> Dict[str, Any]:
        normalized = AuditLog.from_dict(document).to_dict()
        normalized["previous_value"] = _json_safe(normalized.get("previous_value"))
        normalized["new_value"] = _json_safe(normalized.get("new_value"))
        raw_action = str(document.get("action", ""))
        legacy_type = raw_action.lower()
        if not document.get("event_type"):
            if "approv" in legacy_type:
                normalized["event_type"] = "question_approved"
                normalized["action"] = "Question Approved"
            elif "reject" in legacy_type:
                normalized["event_type"] = "question_rejected"
                normalized["action"] = "Question Rejected — AI Suggestion Ignored"
            elif "edit" in legacy_type:
                normalized["event_type"] = "manual_edit"
                normalized["action"] = "Manual Edit"
            elif "auto" in legacy_type:
                normalized["event_type"] = "auto_applied"
                normalized["action"] = "Auto Applied"
            elif "report" in legacy_type:
                normalized["event_type"] = "student_report_created"
                normalized["action"] = "Student Report Created"
        return normalized

    async def get_logs(
        self,
        *,
        page: int = 1,
        limit: int = 20,
        event_type: Optional[str] = None,
        action: Optional[str] = None,
        faculty_email: Optional[str] = None,
    ) -> Dict[str, Any]:
        query: Dict[str, Any] = {}
        if event_type:
            event_types = EVENT_FILTERS.get(event_type.lower())
            if event_types:
                legacy_pattern = self._legacy_action_regex(event_type.lower())
                query["$or"] = [
                    {"event_type": {"$in": list(event_types)}},
                    {
                        "event_type": {"$exists": False},
                        "action": {"$regex": legacy_pattern, "$options": "i"},
                    },
                ]
            else:
                query["event_type"] = event_type
        if action:
            query["action"] = {"$regex": re.escape(action), "$options": "i"}
        if faculty_email:
            email_filter = {"$regex": f"^{re.escape(faculty_email)}$", "$options": "i"}
            email_or = [
                {"faculty_email": email_filter},
                {"facultyId": email_filter},
                {"facultyName": email_filter},
            ]
            query = {"$and": [query, {"$or": email_or}]} if query else {"$or": email_or}

        try:
            total = await self.collection.count_documents(query)
            cursor = (
                self.collection.find(query)
                .sort([("timestamp", -1), ("_id", -1)])
                .skip((page - 1) * limit)
                .limit(limit)
            )
            documents = await cursor.to_list(length=limit)
            return {
                "items": [self._normalize_legacy(document) for document in documents],
                "total": total,
                "page": page,
                "limit": limit,
            }
        except Exception as exc:
            logger.exception("Unable to read audit log collection")
            raise HTTPException(status_code=503, detail="Unable to load audit logs.") from exc

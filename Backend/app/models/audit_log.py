"""Immutable audit event document representation."""

from dataclasses import asdict, dataclass
from typing import Any, Dict, Optional


@dataclass
class AuditLog:
    event_type: str
    question_id: str
    action: str
    timestamp: str
    faculty_email: Optional[str] = None
    previous_value: Optional[Any] = None
    new_value: Optional[Any] = None
    report_id: Optional[str] = None
    ai_suggestion_id: Optional[str] = None
    _id: Optional[str] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AuditLog":
        """Read both the current event schema and legacy faculty audit records."""
        return cls(
            _id=str(data["_id"]) if data.get("_id") is not None else None,
            event_type=data.get("event_type") or data.get("eventType") or "legacy_event",
            question_id=str(data.get("question_id") or data.get("questionId") or ""),
            faculty_email=data.get("faculty_email") or data.get("facultyEmail") or data.get("facultyId") or data.get("facultyName"),
            action=data.get("action", ""),
            previous_value=data.get("previous_value", data.get("before")),
            new_value=data.get("new_value", data.get("after")),
            timestamp=str(data.get("timestamp", "")),
            report_id=data.get("report_id") or data.get("reportId"),
            ai_suggestion_id=data.get("ai_suggestion_id") or data.get("aiSuggestionId"),
        )

    def to_dict(self) -> Dict[str, Any]:
        document = asdict(self)
        if self._id is None:
            document.pop("_id", None)
        return document

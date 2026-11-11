from dataclasses import dataclass, asdict
from typing import Any, Dict, Optional


@dataclass
class AuditLog:
    questionId: str
    facultyName: str
    action: str
    timestamp: str
    _id: Optional[str] = None
    repairType: Optional[str] = None
    notes: Optional[str] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AuditLog":
        return cls(
            _id=str(data.get("_id")) if data.get("_id") is not None else None,
            questionId=data.get("questionId", ""),
            facultyName=data.get("facultyName", ""),
            action=data.get("action", ""),
            timestamp=data.get("timestamp", ""),
            repairType=data.get("repairType"),
            notes=data.get("notes"),
        )

    def to_dict(self) -> Dict[str, Any]:
        res = asdict(self)
        if self._id is not None:
            res["_id"] = self._id
        return res

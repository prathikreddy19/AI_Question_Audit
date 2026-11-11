from dataclasses import dataclass, asdict
from typing import Any, Dict, Optional


@dataclass
class Report:
    reportId: str
    questionId: str
    studentId: str
    source: str
    comment: str
    _id: Optional[str] = None
    reportedAt: Optional[str] = None

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Report":
        return cls(
            _id=str(data.get("_id")) if data.get("_id") is not None else None,
            reportId=data.get("reportId", ""),
            questionId=data.get("questionId", ""),
            studentId=data.get("studentId", ""),
            source=data.get("source", "web"),
            comment=data.get("comment", ""),
            reportedAt=data.get("reportedAt"),
        )

    def to_dict(self) -> Dict[str, Any]:
        res = asdict(self)
        if self._id is not None:
            res["_id"] = self._id
        return res

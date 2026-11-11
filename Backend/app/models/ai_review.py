from dataclasses import dataclass, asdict
from typing import Any, Dict, Optional


@dataclass
class ProposedEdit:
    field: str
    replace: str
    find: Optional[str] = ""

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "ProposedEdit":
        return cls(
            field=data.get("field", ""),
            replace=data.get("replace", ""),
            find=data.get("find", ""),
        )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class AIReview:
    reportId: str
    questionId: str
    verdict: str
    confidence: float
    evidence: str
    student_reply: str
    route: str
    _id: Optional[str] = None
    repair: Optional[str] = None
    edit: Optional[ProposedEdit] = None
    status: str = "pending"

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "AIReview":
        edit_data = data.get("edit")
        return cls(
            _id=str(data.get("_id")) if data.get("_id") is not None else None,
            reportId=data.get("reportId", ""),
            questionId=data.get("questionId", ""),
            verdict=data.get("verdict", ""),
            confidence=float(data.get("confidence", 0.0)),
            evidence=data.get("evidence", ""),
            student_reply=data.get("student_reply", ""),
            route=data.get("route", "faculty_review"),
            repair=data.get("repair"),
            edit=ProposedEdit.from_dict(edit_data) if edit_data else None,
            status=data.get("status", "pending"),
        )

    def to_dict(self) -> Dict[str, Any]:
        res = asdict(self)
        if self._id is not None:
            res["_id"] = self._id
        return res

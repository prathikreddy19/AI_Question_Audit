from dataclasses import dataclass, field, asdict
from typing import Any, Dict, List, Optional


@dataclass
class QuestionContent:
    question: str
    solution: Optional[str] = None
    answer: Optional[str] = None
    quesImages: List[Any] = field(default_factory=list)
    solutionImages: List[Any] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "QuestionContent":
        return cls(
            question=data.get("question", ""),
            solution=data.get("solution"),
            answer=data.get("answer"),
            quesImages=data.get("quesImages", []),
            solutionImages=data.get("solutionImages", []),
        )

    def to_dict(self) -> Dict[str, Any]:
        return asdict(self)


@dataclass
class Question:
    _id: Optional[str] = None
    qid: Optional[str] = None
    questionType: str = "scq"
    subject: Optional[str] = None
    chapter: Optional[str] = None
    concept: Optional[str] = None
    subConcept: Optional[str] = None
    level: Optional[str] = "MEDIUM"
    error: Optional[int] = 0
    updatedAt: Optional[str] = None
    scq: Optional[QuestionContent] = None
    mcq: Optional[QuestionContent] = None
    integerQuestion: Optional[QuestionContent] = None
    errorHistory: List[Any] = field(default_factory=list)

    @classmethod
    def from_dict(cls, data: Dict[str, Any]) -> "Question":
        scq_data = data.get("scq")
        mcq_data = data.get("mcq")
        int_data = data.get("integerQuestion")

        return cls(
            _id=str(data.get("_id")) if data.get("_id") is not None else None,
            qid=data.get("qid"),
            questionType=data.get("questionType", "scq"),
            subject=data.get("subject"),
            chapter=data.get("chapter"),
            concept=data.get("concept"),
            subConcept=data.get("subConcept"),
            level=data.get("level", "MEDIUM"),
            error=data.get("error", 0),
            updatedAt=data.get("updatedAt"),
            scq=QuestionContent.from_dict(scq_data) if scq_data else None,
            mcq=QuestionContent.from_dict(mcq_data) if mcq_data else None,
            integerQuestion=QuestionContent.from_dict(int_data) if int_data else None,
            errorHistory=data.get("errorHistory", []),
        )

    def to_dict(self) -> Dict[str, Any]:
        res = asdict(self)
        if self._id is not None:
            res["_id"] = self._id
        return res

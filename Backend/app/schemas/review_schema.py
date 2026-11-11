from typing import Optional, Dict, Any
from pydantic import BaseModel, ConfigDict, Field


class ProposedEditSchema(BaseModel):
    """Surgical proposed edit structure."""
    field: str = Field(..., description="Field to modify: answer, question, solution, etc.")
    find: Optional[str] = Field(default="", description="Target text to replace")
    replace: str = Field(..., description="Replacement text")

    model_config = ConfigDict(extra="ignore")


class AIReviewBaseSchema(BaseModel):
    """Base schema for AI Triage Review."""
    reportId: str
    questionId: str
    verdict: str
    repair: Optional[str] = None
    edit: Optional[ProposedEditSchema] = None
    confidence: float = Field(ge=0.0, le=1.0)
    evidence: str
    student_reply: str
    route: str = Field(description="auto_apply | faculty_review | no_change")
    status: Optional[str] = Field(default="pending", description="pending | approved | rejected | auto_applied")

    model_config = ConfigDict(populate_by_name=True, extra="ignore")


class AIReviewCreateSchema(AIReviewBaseSchema):
    """Schema for persisting an AI Review result."""
    pass


class AIReviewResponseSchema(AIReviewBaseSchema):
    """Schema for returning AI Review data."""
    id: Optional[str] = Field(default=None, alias="_id")

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

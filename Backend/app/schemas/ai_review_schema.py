"""
ai_review_schema.py — Task 6

Pydantic v2 schemas for AI Review requests and responses.
"""

from typing import Any, Dict, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class ProposedEditSchema(BaseModel):
    """Surgical edit proposed by the AI."""
    field: str = Field(..., description="Field to modify: answer, question, solution, etc.")
    find: Optional[str] = Field(default="", description="Exact text to replace (empty = append/full replace)")
    replace: str = Field(..., description="Replacement text")

    model_config = ConfigDict(extra="ignore")


class AIReviewResponseSchema(BaseModel):
    """Full AI review result returned to API clients."""
    id: Optional[str] = Field(default=None, alias="_id")
    reportId: str
    questionId: str
    verdict: str = Field(description="Taxonomy verdict key")
    repair: Optional[str] = Field(default=None, description="Taxonomy repair key or null")
    edit: Optional[ProposedEditSchema] = Field(default=None)
    route: str = Field(description="auto_apply | faculty_review | no_change")
    confidence: float = Field(ge=0.0, le=1.0)
    evidence: str
    student_reply: str
    status: Optional[str] = Field(default="pending", description="pending | approved | rejected | auto_applied")
    validation_errors: Optional[List[str]] = Field(default=None)

    model_config = ConfigDict(populate_by_name=True, extra="ignore")


class ReviewAllResponseSchema(BaseModel):
    """Wrapper for the review-all batch endpoint."""
    total: int
    results: List[Dict[str, Any]]

    model_config = ConfigDict(extra="ignore")

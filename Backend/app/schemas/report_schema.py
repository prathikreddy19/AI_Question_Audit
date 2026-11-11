from typing import Optional
from datetime import datetime, timezone
from pydantic import BaseModel, ConfigDict, Field


class ReportBaseSchema(BaseModel):
    """Base schema for Student Error Report."""
    questionId: str
    studentId: str
    source: str = Field(default="web", description="Device platform (web, android, ios)")
    comment: str

    model_config = ConfigDict(populate_by_name=True, extra="ignore")


class ReportCreateSchema(ReportBaseSchema):
    """Schema for creating a new Student Report via POST /reports."""
    reportId: Optional[str] = None
    reportedAt: Optional[str] = None


class ReportResponseSchema(ReportBaseSchema):
    """Schema returned to API clients."""
    id: Optional[str] = Field(default=None, alias="_id")
    reportId: str
    reportedAt: Optional[str] = None

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

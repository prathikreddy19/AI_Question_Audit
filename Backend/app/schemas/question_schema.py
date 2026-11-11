from typing import Any, List, Optional
from pydantic import BaseModel, ConfigDict, Field


class QuestionContentSchema(BaseModel):
    """Content schema for question text, solution, images, and answer."""
    question: str
    solution: Optional[str] = None
    # MCQ answers are stored as either a string or a list of selected options.
    answer: Optional[Any] = None
    quesImages: List[Any] = Field(default_factory=list)
    solutionImages: List[Any] = Field(default_factory=list)

    model_config = ConfigDict(extra="ignore")


class QuestionBaseSchema(BaseModel):
    """Base schema for Question attributes."""
    qid: Optional[str] = None
    questionType: str
    subject: Optional[str] = None
    chapter: Optional[str] = None
    concept: Optional[str] = None
    subConcept: Optional[str] = None
    level: Optional[str] = None
    error: Optional[int] = 0
    updatedAt: Optional[str] = None
    scq: Optional[QuestionContentSchema] = None
    mcq: Optional[QuestionContentSchema] = None
    integerQuestion: Optional[QuestionContentSchema] = None
    errorHistory: List[Any] = Field(default_factory=list)

    model_config = ConfigDict(populate_by_name=True, extra="ignore")


class QuestionCreateSchema(QuestionBaseSchema):
    """Schema for creating a new Question."""
    pass


class QuestionUpdateSchema(BaseModel):
    """Schema for updating an existing Question."""
    qid: Optional[str] = None
    questionType: Optional[str] = None
    subject: Optional[str] = None
    chapter: Optional[str] = None
    concept: Optional[str] = None
    subConcept: Optional[str] = None
    level: Optional[str] = None
    error: Optional[int] = None
    updatedAt: Optional[str] = None
    scq: Optional[QuestionContentSchema] = None
    mcq: Optional[QuestionContentSchema] = None
    integerQuestion: Optional[QuestionContentSchema] = None

    model_config = ConfigDict(extra="ignore")


class QuestionResponseSchema(QuestionBaseSchema):
    """Response schema returned to clients."""
    id: Optional[str] = Field(default=None, alias="_id")

    model_config = ConfigDict(populate_by_name=True, extra="ignore")

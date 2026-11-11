import logging
from typing import List
from fastapi import APIRouter, Depends, HTTPException, Query, status
from app.schemas.question_schema import QuestionResponseSchema
from app.services.question_service import QuestionService, get_question_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/questions", tags=["Questions"])


@router.get(
    "",
    response_model=List[QuestionResponseSchema],
    status_code=status.HTTP_200_OK,
    summary="Get all questions",
    description="Retrieve a paginated list of JEE/NEET questions.",
)
async def get_questions(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=500, description="Max items to return"),
    service: QuestionService = Depends(get_question_service),
):
    """Retrieve all questions stored in MongoDB."""
    questions = await service.get_all_questions(limit=limit, skip=skip)
    return questions


@router.get(
    "/{questionId}",
    response_model=QuestionResponseSchema,
    status_code=status.HTTP_200_OK,
    summary="Get question by ID",
    description="Retrieve question details by _id or qid.",
)
async def get_question_by_id(
    questionId: str,
    service: QuestionService = Depends(get_question_service),
):
    """Retrieve a single question by its identifier."""
    question = await service.get_question(question_id=questionId)
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Question with ID '{questionId}' not found.",
        )
    return question

import logging
from typing import List
from fastapi import APIRouter, Depends, Query, status
from app.schemas.report_schema import ReportCreateSchema, ReportResponseSchema
from app.services.report_service import ReportService, get_report_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/reports", tags=["Reports"])


@router.post(
    "",
    response_model=ReportResponseSchema,
    status_code=status.HTTP_201_CREATED,
    summary="Create student report",
    description="Submit a new student defect report for a question.",
)
async def create_report(
    report: ReportCreateSchema,
    service: ReportService = Depends(get_report_service),
):
    """Submit a new student error report."""
    created = await service.create_report(report)
    return created


@router.get(
    "",
    response_model=List[ReportResponseSchema],
    status_code=status.HTTP_200_OK,
    summary="Get all reports",
    description="Retrieve all student reports in the system.",
)
async def get_reports(
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=500, description="Max items to return"),
    service: ReportService = Depends(get_report_service),
):
    """Retrieve all reports with pagination."""
    reports = await service.get_reports(limit=limit, skip=skip)
    return reports


@router.get(
    "/{questionId}",
    response_model=List[ReportResponseSchema],
    status_code=status.HTTP_200_OK,
    summary="Get reports for question",
    description="Retrieve all student reports filed for a specific questionId.",
)
async def get_reports_by_question_id(
    questionId: str,
    skip: int = Query(0, ge=0, description="Number of items to skip"),
    limit: int = Query(100, ge=1, le=500, description="Max items to return"),
    service: ReportService = Depends(get_report_service),
):
    """Retrieve reports matching the given questionId."""
    reports = await service.get_reports_by_question(
        question_id=questionId, limit=limit, skip=skip
    )
    return reports

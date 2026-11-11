"""
api/ai.py — Task 7

Endpoints:
  POST /ai/review/{reportId}   — trigger AI review for one report
  POST /ai/analyze-pending     — analyze reports without an AI review
  POST /ai/review-all          — legacy alias for pending-only analysis
  GET  /ai/review/{reportId}   — retrieve stored review
"""

import logging
from fastapi import APIRouter, Depends, HTTPException, status

from app.services.review_service import ReviewService, get_review_service

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/ai", tags=["AI Review"])


@router.post(
    "/review/{reportId}",
    status_code=status.HTTP_200_OK,
    summary="Run AI review for a single report",
    description=(
        "Triggers the full AI pipeline: loads the report + question, "
        "builds a prompt, calls Gemini, validates output, persists and returns the review."
    ),
)
async def run_review(
    reportId: str,
    service: ReviewService = Depends(get_review_service),
):
    """Generate and store an AI review for the given reportId."""
    result = await service.review_report(reportId)

    if "error" in result:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=result["error"],
        )

    return result


@router.post(
    "/analyze-pending",
    status_code=status.HTTP_200_OK,
    summary="Analyze reports without an AI review",
    description="Runs the existing review pipeline only for reportIds absent from ai_reviews.",
)
async def analyze_pending_reports(
    service: ReviewService = Depends(get_review_service),
):
    logger.info("Pending report analysis triggered")
    return await service.analyze_pending_reports()


@router.post(
    "/review-all",
    status_code=status.HTTP_200_OK,
    summary="Analyze reports without an AI review (legacy route)",
    description="Compatibility alias; existing AI reviews are never rerun.",
)
async def run_review_all(
    service: ReviewService = Depends(get_review_service),
):
    """Backward-compatible batch route that now processes only pending reports."""
    logger.info("Legacy review-all endpoint used; analyzing pending reports only")
    return await service.analyze_pending_reports()


@router.get(
    "/review/{reportId}",
    status_code=status.HTTP_200_OK,
    summary="Get stored AI review for a report",
    description="Retrieve the previously generated AI review for a reportId.",
)
async def get_review(
    reportId: str,
    service: ReviewService = Depends(get_review_service),
):
    """Fetch the stored AI review (does not re-run Gemini)."""
    review = await service.get_review(reportId)
    if not review:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"No AI review found for reportId '{reportId}'. Run POST /ai/review/{reportId} first.",
        )
    return review

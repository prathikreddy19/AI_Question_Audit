"""Faculty dashboard and review decision endpoints."""

from typing import Any, Dict, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import BaseModel, ConfigDict, Field

from app.services.faculty_service import FacultyService, get_faculty_service

router = APIRouter(prefix="/faculty", tags=["Faculty Review"])


class FacultyAction(BaseModel):
    facultyId: str = Field(default="faculty", min_length=1, max_length=128)
    model_config = ConfigDict(extra="forbid")


class RejectAction(FacultyAction):
    reason: str = Field(min_length=1, max_length=2000)


class EditReviewRequest(FacultyAction):
    verdict: Optional[str] = None
    repair: Optional[str] = None
    edit: Optional[Dict[str, Any]] = None
    student_reply: Optional[str] = None
    route: Optional[str] = None
    confidence: Optional[float] = Field(default=None, ge=0, le=1)

    def review_updates(self) -> Dict[str, Any]:
        return self.model_dump(exclude={"facultyId"}, exclude_unset=True)


@router.get("/dashboard", status_code=status.HTTP_200_OK)
async def get_dashboard(service: FacultyService = Depends(get_faculty_service)):
    return await service.get_dashboard()


@router.get("/reports", status_code=status.HTTP_200_OK)
async def get_review_queue(
    page: int = Query(1, ge=1),
    limit: int = Query(20, ge=1, le=100),
    status_filter: Optional[str] = Query(default="pending", alias="status"),
    search: Optional[str] = Query(default=None, max_length=200),
    service: FacultyService = Depends(get_faculty_service),
):
    if status_filter and status_filter not in {"pending", "approved", "rejected"}:
        raise HTTPException(status_code=422, detail="status must be pending, approved, or rejected.")
    return await service.get_review_queue(
        page=page, limit=limit, review_status=status_filter, search=search
    )


@router.get("/report/{reportId}", status_code=status.HTTP_200_OK)
async def get_review_details(
    reportId: str,
    service: FacultyService = Depends(get_faculty_service),
):
    return await service.get_review(reportId)


@router.post("/approve/{reportId}", status_code=status.HTTP_200_OK)
async def approve_review(
    reportId: str,
    request: Optional[FacultyAction] = None,
    service: FacultyService = Depends(get_faculty_service),
):
    return await service.approve_review(reportId, request.facultyId if request else "faculty")


@router.post("/reject/{reportId}", status_code=status.HTTP_200_OK)
async def reject_review(
    reportId: str,
    request: RejectAction,
    service: FacultyService = Depends(get_faculty_service),
):
    return await service.reject_review(reportId, request.facultyId, request.reason)


@router.put("/edit/{reportId}", status_code=status.HTTP_200_OK)
async def edit_review(
    reportId: str,
    request: EditReviewRequest,
    service: FacultyService = Depends(get_faculty_service),
):
    return await service.edit_review(
        reportId, request.facultyId, request.review_updates()
    )

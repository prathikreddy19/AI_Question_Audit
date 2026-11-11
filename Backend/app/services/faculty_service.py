"""Faculty review queue, decisions, question updates, and audit logging."""

import logging
import re
from datetime import datetime, timezone
from typing import Any, Dict, Optional

from bson import ObjectId
from fastapi import Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from pymongo import ReturnDocument

from app.database.database import get_database
from app.services.audit_log_service import AuditLogService
from app.services.question_service import QuestionService

logger = logging.getLogger(__name__)


class FacultyService:
    """Application service for faculty review actions."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.db = db
        self.reviews = db.ai_reviews
        self.reports = db.reports
        self.questions = db.questions
        self.audit_log_service = AuditLogService(db)
        self.question_service = QuestionService(db)

    @staticmethod
    def _database_error(action: str, exc: Exception) -> HTTPException:
        logger.exception("MongoDB operation failed: %s", action)
        return HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Unable to {action} because the database is unavailable.",
        )

    async def _load_context(self, report_id: str) -> tuple[Dict[str, Any], Dict[str, Any], Dict[str, Any]]:
        try:
            report = await self.reports.find_one({"reportId": report_id})
            if report is None:
                raise HTTPException(status_code=404, detail=f"Report '{report_id}' not found.")
            review = await self.reviews.find_one({"reportId": report_id})
            if review is None:
                raise HTTPException(status_code=404, detail=f"Review for report '{report_id}' not found.")
            question_id = str(review.get("questionId") or report.get("questionId") or "")
            question = await self.question_service.get_question(question_id)
            if question is None:
                raise HTTPException(status_code=404, detail=f"Question '{question_id}' not found.")
            return review, report, question
        except HTTPException:
            raise
        except Exception as exc:
            raise self._database_error("load review details", exc) from exc

    async def _audit(
        self,
        *,
        report_id: str,
        question_id: str,
        faculty_id: str,
        event_type: str,
        action: str,
        before: Dict[str, Any],
        after: Dict[str, Any],
        ai_suggestion_id: Optional[str] = None,
    ) -> None:
        await self.audit_log_service.record_event(
            event_type=event_type,
            question_id=question_id,
            faculty_email=faculty_id,
            action=action,
            previous_value=before,
            new_value=after,
            report_id=report_id,
            ai_suggestion_id=ai_suggestion_id,
        )

    @staticmethod
    def _pending_review_filter(review: Dict[str, Any]) -> Dict[str, Any]:
        """Match pending reviews, including older AI reviews with no status field."""
        return {
            "_id": review["_id"],
            "$or": [
                {"status": "pending"},
                {"status": None},  # MongoDB also matches documents where status is absent.
            ],
        }

    async def get_dashboard(self) -> Dict[str, int]:
        logger.info("Faculty dashboard requested")
        try:
            return {
                "total_reports": await self.reports.count_documents({}),
                "pending_reviews": await self.reviews.count_documents(
                    {"$or": [{"status": "pending"}, {"status": None}]}
                ),
                "approved": await self.reviews.count_documents({"status": "approved"}),
                "rejected": await self.reviews.count_documents({"status": "rejected"}),
                "auto_applied": await self.reviews.count_documents(
                    {"$or": [{"status": "auto_applied"}, {"route": "auto_apply"}]}
                ),
                "faculty_review": await self.reviews.count_documents({"route": "faculty_review"}),
            }
        except Exception as exc:
            raise self._database_error("load dashboard", exc) from exc

    async def get_review_queue(
        self,
        *,
        page: int = 1,
        limit: int = 20,
        review_status: Optional[str] = "pending",
        search: Optional[str] = None,
    ) -> list[Dict[str, Any]]:
        logger.info("Faculty queue requested page=%d limit=%d", page, limit)
        try:
            pipeline: list[Dict[str, Any]] = [
                {"$lookup": {"from": self.reports.name, "localField": "reportId", "foreignField": "reportId", "as": "report"}},
                {"$unwind": {"path": "$report", "preserveNullAndEmptyArrays": True}},
                {
                    "$lookup": {
                        "from": self.questions.name,
                        "let": {"qid": {"$ifNull": ["$report.questionId", "$questionId"]}},
                        "pipeline": [{"$match": {"$expr": {"$or": [
                            {"$eq": [{"$toString": "$_id"}, "$$qid"]},
                            {"$eq": ["$qid", "$$qid"]},
                        ]}}}],
                        "as": "question",
                    }
                },
                {"$unwind": {"path": "$question", "preserveNullAndEmptyArrays": True}},
            ]
            match_clauses: list[Dict[str, Any]] = []
            if review_status == "pending":
                match_clauses.append({"$or": [{"status": "pending"}, {"status": None}]})
            elif review_status:
                match_clauses.append({"status": review_status})
            if search:
                regex = re.compile(re.escape(search), re.IGNORECASE)
                match_clauses.append({"$or": [
                    {"reportId": regex}, {"questionId": regex},
                    {"report.comment": regex}, {"question.subject": regex},
                    {"question.chapter": regex}, {"verdict": regex},
                ]})
            if match_clauses:
                pipeline.append({"$match": match_clauses[0] if len(match_clauses) == 1 else {"$and": match_clauses}})
            pipeline.extend([
                {"$addFields": {"_pending_order": {"$cond": [{"$eq": [{"$ifNull": ["$status", "pending"]}, "pending"]}, 0, 1]}}},
                {"$sort": {"_pending_order": 1, "confidence": -1, "report.reportedAt": -1}},
                {"$skip": (page - 1) * limit},
                {"$limit": limit},
                {"$project": {
                    "_id": 0,
                    "reportId": 1,
                    "questionId": 1,
                    "subject": "$question.subject",
                    "chapter": "$question.chapter",
                    "student_comment": "$report.comment",
                    "verdict": 1,
                    "repair": 1,
                    "confidence": 1,
                    "route": 1,
                    "status": 1,
                }},
            ])
            return await self.reviews.aggregate(pipeline).to_list(length=limit)
        except Exception as exc:
            raise self._database_error("load review queue", exc) from exc

    async def get_review(self, report_id: str) -> Dict[str, Any]:
        logger.info("Faculty review opened reportId=%s", report_id)
        review, report, question = await self._load_context(report_id)
        edit = review.get("edit")
        before_after = None
        if isinstance(edit, dict):
            field = edit.get("field")
            content_type = question.get("questionType")
            content = question.get(content_type, {}) if content_type else {}
            current = content.get(field) if isinstance(content, dict) else question.get(field)
            before_after = {"field": field, "before": current, "after": self._preview_edit(current, edit)}
        for document in (review, report, question):
            if document.get("_id") is not None:
                document["_id"] = str(document["_id"])
        return {
            "question": question,
            "report": report,
            "ai_review": review,
            "before_after": before_after,
            "student_reply": review.get("student_reply"),
            "evidence": review.get("evidence"),
            "validation_errors": review.get("validation_errors", []),
        }

    @staticmethod
    def _preview_edit(current: Any, edit: Dict[str, Any]) -> Any:
        current_text = "" if current is None else str(current)
        find_text = edit.get("find") or ""
        replacement = edit.get("replace", "")
        if not find_text:
            return replacement
        return current_text.replace(find_text, replacement, 1)

    async def _apply_question_edit(self, question: Dict[str, Any], edit: Dict[str, Any]) -> Dict[str, Any]:
        field = edit.get("field")
        if not isinstance(field, str) or not field or not isinstance(edit.get("replace"), str):
            raise HTTPException(status_code=422, detail="Review edit requires a field and string replacement.")
        question_type = question.get("questionType")
        content = question.get(question_type, {}) if question_type else {}
        if isinstance(content, dict) and field in content:
            path = f"{question_type}.{field}"
            current_value = content.get(field)
        elif field in question:
            path = field
            current_value = question.get(field)
        else:
            raise HTTPException(status_code=422, detail=f"Edit field '{field}' does not exist on this question.")
        if not isinstance(current_value, str):
            raise HTTPException(status_code=422, detail=f"Edit field '{field}' is not text.")
        find_text = edit.get("find") or ""
        if not isinstance(find_text, str):
            raise HTTPException(status_code=422, detail="edit.find must be a string.")
        if find_text and find_text not in current_value:
            raise HTTPException(status_code=409, detail=f"Text to replace was not found in question field '{field}'.")
        updated_value = current_value.replace(find_text, edit["replace"], 1) if find_text else edit["replace"]
        query: Dict[str, Any] = {"_id": question.get("_id")}
        if ObjectId.is_valid(str(query["_id"])):
            query["_id"] = ObjectId(str(query["_id"]))
        try:
            result = await self.questions.update_one(
                query,
                {"$set": {path: updated_value, "updatedAt": datetime.now(timezone.utc).isoformat()}},
            )
            if result.matched_count != 1:
                raise HTTPException(status_code=404, detail="Question no longer exists.")
        except HTTPException:
            raise
        except Exception as exc:
            raise self._database_error("update question", exc) from exc
        after_question = dict(question)
        if path == field:
            after_question[field] = updated_value
        else:
            after_question.setdefault(question_type, dict(content))[field] = updated_value
        return after_question

    async def approve_review(self, report_id: str, faculty_id: str) -> Dict[str, Any]:
        review, report, question = await self._load_context(report_id)
        if review.get("status", "pending") != "pending":
            raise HTTPException(status_code=409, detail="Only pending reviews can be approved.")
        before = {"review": dict(review), "question": dict(question)}
        after_question = question
        edit = review.get("edit")
        if edit:
            if not isinstance(edit, dict):
                raise HTTPException(status_code=422, detail="Stored review edit is invalid.")
            after_question = await self._apply_question_edit(question, edit)
        now = datetime.now(timezone.utc).isoformat()
        try:
            updated_review = await self.reviews.find_one_and_update(
                self._pending_review_filter(review),
                {"$set": {"status": "approved", "updated_at": now}},
                return_document=ReturnDocument.AFTER,
            )
            if updated_review is None:
                raise HTTPException(status_code=409, detail="Review changed before approval could complete.")
        except HTTPException:
            raise
        except Exception as exc:
            raise self._database_error("approve review", exc) from exc
        after = {"review": updated_review, "question": after_question}
        await self._audit(
            report_id=report_id,
            question_id=str(review["questionId"]),
            faculty_id=faculty_id,
            event_type="question_approved",
            action="Question Approved — AI Suggestion Applied" if edit else "Question Approved",
            before=before,
            after=after,
            ai_suggestion_id=str(review.get("_id", "")) or None,
        )
        if updated_review.get("_id") is not None:
            updated_review["_id"] = str(updated_review["_id"])
        logger.info("Faculty review approved reportId=%s", report_id)
        return {"message": "Review approved.", "review": updated_review}

    async def reject_review(self, report_id: str, faculty_id: str, reason: str) -> Dict[str, Any]:
        if not reason.strip():
            raise HTTPException(status_code=422, detail="A rejection reason is required.")
        review, _, _ = await self._load_context(report_id)
        if review.get("status", "pending") != "pending":
            raise HTTPException(status_code=409, detail="Only pending reviews can be rejected.")
        before = dict(review)
        now = datetime.now(timezone.utc).isoformat()
        try:
            after = await self.reviews.find_one_and_update(
                self._pending_review_filter(review),
                {"$set": {"status": "rejected", "rejection_reason": reason.strip(), "updated_at": now}},
                return_document=ReturnDocument.AFTER,
            )
            if after is None:
                raise HTTPException(status_code=409, detail="Review changed before rejection could complete.")
        except HTTPException:
            raise
        except Exception as exc:
            raise self._database_error("reject review", exc) from exc
        await self._audit(
            report_id=report_id,
            question_id=str(review["questionId"]),
            faculty_id=faculty_id,
            event_type="question_rejected",
            action="Question Rejected — AI Suggestion Ignored",
            before=before,
            after=after,
            ai_suggestion_id=str(review.get("_id", "")) or None,
        )
        if after.get("_id") is not None:
            after["_id"] = str(after["_id"])
        logger.info("Faculty review rejected reportId=%s", report_id)
        return {"message": "Review rejected.", "review": after}

    async def edit_review(self, report_id: str, faculty_id: str, updates: Dict[str, Any]) -> Dict[str, Any]:
        allowed = {"verdict", "repair", "edit", "student_reply", "route", "confidence"}
        changes = {key: value for key, value in updates.items() if key in allowed}
        if not changes:
            raise HTTPException(status_code=422, detail="At least one editable review field is required.")
        if "confidence" in changes and (
            isinstance(changes["confidence"], bool)
            or not isinstance(changes["confidence"], (int, float))
            or not 0 <= changes["confidence"] <= 1
        ):
            raise HTTPException(status_code=422, detail="Confidence must be between 0 and 1.")
        for key in ("verdict", "route", "student_reply"):
            if key in changes and not isinstance(changes[key], str):
                raise HTTPException(status_code=422, detail=f"{key} must be a string.")
        if "edit" in changes and changes["edit"] is not None:
            edit = changes["edit"]
            if not isinstance(edit, dict) or not isinstance(edit.get("field"), str) or not isinstance(edit.get("replace"), str):
                raise HTTPException(status_code=422, detail="edit must include string field and replace values.")
            if "find" in edit and not isinstance(edit["find"], str):
                raise HTTPException(status_code=422, detail="edit.find must be a string.")
        review, _, question = await self._load_context(report_id)
        if review.get("status", "pending") != "pending":
            raise HTTPException(status_code=409, detail="Only pending reviews can be edited.")
        if "route" in changes and changes["route"] not in {"auto_apply", "faculty_review", "no_change"}:
            raise HTTPException(status_code=422, detail="route must be auto_apply, faculty_review, or no_change.")
        before = {"review": dict(review), "question": dict(question)}
        after_question = question
        if "edit" in changes and changes["edit"] is not None:
            after_question = await self._apply_question_edit(question, changes["edit"])
        changes.update({"status": "approved", "updated_at": datetime.now(timezone.utc).isoformat()})
        try:
            await self.reviews.update_one({"reportId": report_id, "status": "pending"}, {"$set": changes})
            after = await self.reviews.find_one({"reportId": report_id})
        except Exception as exc:
            raise self._database_error("edit review", exc) from exc
        if after is None or after.get("status") != "approved":
            raise HTTPException(status_code=409, detail="Review changed before edit could be saved.")
        await self._audit(
            report_id=report_id,
            question_id=str(review["questionId"]),
            faculty_id=faculty_id,
            event_type="manual_edit",
            action="Manual Edit",
            before=before,
            after={"review": after, "question": after_question},
            ai_suggestion_id=str(review.get("_id", "")) or None,
        )
        if after.get("_id") is not None:
            after["_id"] = str(after["_id"])
        logger.info("Faculty review edited reportId=%s", report_id)
        return {"message": "Review edited and approved.", "review": after}


def get_faculty_service(
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> FacultyService:
    """FastAPI dependency using the application's existing Motor database."""
    return FacultyService(db)

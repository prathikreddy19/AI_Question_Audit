"""Coordinates the AI review pipeline and persists review outcomes."""

import logging
from datetime import datetime, timezone
from time import perf_counter
from typing import Any, Dict, List, Optional

from fastapi import Depends, HTTPException
from motor.motor_asyncio import AsyncIOMotorDatabase

from app.database.database import get_database
from app.services import ai_service, taxonomy_service, validation_service
from app.services.audit_log_service import AuditLogService
from app.services.prompt_service import build_review_prompt
from app.services.question_service import QuestionService
from app.services.report_service import ReportService

logger = logging.getLogger(__name__)

REPORT_PAGE_SIZE = 500


class ReviewService:
    """Orchestrate report lookup, AI review, validation, and persistence."""

    def __init__(self, db: AsyncIOMotorDatabase) -> None:
        self.db = db
        self.report_service = ReportService(db)
        self.question_service = QuestionService(db)
        self.ai_reviews = db.ai_reviews
        self.audit_log_service = AuditLogService(db)

    async def _get_report(self, report_id: str) -> Optional[Dict[str, Any]]:
        """Find one report through the existing report service interface."""
        skip = 0
        while True:
            reports = await self.report_service.get_reports(
                limit=REPORT_PAGE_SIZE, skip=skip
            )
            for report in reports:
                if report.get("reportId") == report_id:
                    return report
            if len(reports) < REPORT_PAGE_SIZE:
                return None
            skip += len(reports)

    @staticmethod
    def _fallback(
        report: Dict[str, Any],
        errors: List[str],
    ) -> Dict[str, Any]:
        """Build a persistable manual-review record after an orchestration error."""
        return {
            "reportId": report.get("reportId", ""),
            "questionId": report.get("questionId", ""),
            "studentId": report.get("studentId"),
            "verdict": "not_actionable",
            "repair": None,
            "edit": None,
            "route": "faculty_review",
            "confidence": 0.0,
            "evidence": "Automated review could not be completed; manual review is required.",
            "student_reply": "Thank you for your report. Our team will review it manually.",
            "validation_passed": False,
            "validation_errors": errors,
            "reason": "LLM output failed validation",
        }

    async def _save_review(self, review: Dict[str, Any]) -> Dict[str, Any]:
        """Upsert by reportId and return the stored JSON-safe document."""
        now = datetime.now(timezone.utc).isoformat()
        existing = await self.ai_reviews.find_one({"reportId": review["reportId"]})
        review["created_at"] = existing.get("created_at", now) if existing else now
        review["updated_at"] = now
        review.pop("_id", None)

        await self.ai_reviews.replace_one(
            {"reportId": review["reportId"]}, review, upsert=True
        )
        saved = await self.ai_reviews.find_one({"reportId": review["reportId"]})
        if saved is None:
            raise RuntimeError("Review write completed but the saved document was not found")
        saved["_id"] = str(saved["_id"])
        return saved

    async def review_report(self, report_id: str) -> Dict[str, Any]:
        """Run and persist one report review without allowing pipeline errors to escape."""
        logger.info("Review started reportId=%s", report_id)
        report: Optional[Dict[str, Any]] = None

        try:
            report = await self._get_report(report_id)
            if report is None:
                logger.warning("Report missing reportId=%s", report_id)
                return {"error": f"Report '{report_id}' not found.", "reportId": report_id}

            question_id = str(report.get("questionId", ""))
            question = await self.question_service.get_question(question_id)
            if question is None:
                logger.warning("Question missing reportId=%s questionId=%s", report_id, question_id)
                review = self._fallback(report, [f"Question '{question_id}' not found."])
                review["reason"] = "Question not found"
                saved = await self._save_review(review)
                logger.info("Mongo saved fallback review reportId=%s", report_id)
                logger.info("Review finished reportId=%s", report_id)
                return saved

            taxonomy = taxonomy_service.get_taxonomy()
            prompt = build_review_prompt(question, report, taxonomy)
            logger.info("Prompt built reportId=%s", report_id)

            ai_output = await ai_service.generate_review(prompt)
            logger.info("Gemini completed reportId=%s", report_id)

            validation = validation_service.validate_ai_output(ai_output)
            # AIService reports provider/parse failures as a safe fallback payload.
            # Treat that payload as an orchestration failure even if its shape validates.
            if str(ai_output.get("evidence", "")).startswith("AI pipeline error:"):
                validation.valid = False
                validation.errors.append(str(ai_output["evidence"]))
            logger.info(
                "Validation completed reportId=%s valid=%s errors=%d",
                report_id,
                validation.valid,
                len(validation.errors),
            )

            if validation.valid:
                review = {
                    "reportId": report.get("reportId", report_id),
                    "questionId": question_id,
                    "studentId": report.get("studentId"),
                    "verdict": ai_output["verdict"],
                    "repair": ai_output["repair"],
                    "edit": ai_output.get("edit"),
                    "route": ai_output["route"],
                    "confidence": ai_output["confidence"],
                    "evidence": ai_output["evidence"],
                    "student_reply": ai_output["student_reply"],
                    "validation_passed": True,
                    "validation_errors": [],
                }
            else:
                review = self._fallback(report, validation.errors)

            saved = await self._save_review(review)
            if review.get("validation_passed") and review.get("route") == "auto_apply":
                await self.audit_log_service.record_event(
                    event_type="auto_applied",
                    question_id=question_id,
                    action="Auto Applied",
                    previous_value={"edit": None},
                    new_value={"edit": review.get("edit"), "verdict": review.get("verdict")},
                    report_id=report_id,
                    ai_suggestion_id=saved.get("_id"),
                )
            logger.info("Mongo saved review reportId=%s", report_id)
            logger.info("Review finished reportId=%s", report_id)
            return saved

        except Exception as exc:  # Keep per-report failures HTTP-safe and batch-safe.
            logger.exception("Review pipeline failed reportId=%s", report_id)
            if report is None:
                return {"error": "Unable to load report for review.", "reportId": report_id}

            fallback = self._fallback(report, [f"Review pipeline error: {type(exc).__name__}"])
            fallback["reason"] = "LLM output failed validation"
            try:
                saved = await self._save_review(fallback)
                logger.info("Mongo saved fallback review reportId=%s", report_id)
                logger.info("Review finished reportId=%s", report_id)
                return saved
            except Exception:
                logger.exception("Unable to save fallback review reportId=%s", report_id)
                return {
                    "error": "Review could not be completed or saved.",
                    "reportId": report_id,
                }

    async def review_all_reports(self) -> Dict[str, Any]:
        """Backward-compatible name for analyzing only reports without an AI review."""
        return await self.analyze_pending_reports()

    async def analyze_pending_reports(self) -> Dict[str, Any]:
        """Review reports whose reportId has no corresponding AI review document."""
        started = perf_counter()
        processed = success = failed = 0

        try:
            reviewed_report_ids = set(await self.ai_reviews.distinct("reportId"))
            cursor = self.report_service.collection.find(
                {"reportId": {"$nin": list(reviewed_report_ids)}},
                {"reportId": 1},
            )
            pending_reports = await cursor.to_list(length=None)
        except Exception as exc:
            logger.exception("Unable to load reports pending AI analysis")
            raise HTTPException(
                status_code=503,
                detail="Unable to load reports pending AI analysis.",
            ) from exc

        if not pending_reports:
            return {
                "processed": 0,
                "success": 0,
                "failed": 0,
                "message": "No pending reports.",
            }

        for report in pending_reports:
            report_id = report.get("reportId")
            processed += 1
            if not report_id:
                failed += 1
                logger.warning("Skipping report without reportId")
                continue
            try:
                result = await self.review_report(str(report_id))
                if result.get("error") or result.get("validation_passed") is False:
                    failed += 1
                else:
                    success += 1
            except Exception:
                failed += 1
                logger.exception("Pending report analysis failed reportId=%s", report_id)

        return {
            "processed": processed,
            "success": success,
            "failed": failed,
            "execution_time_ms": round((perf_counter() - started) * 1000, 2),
        }

    async def get_review(self, report_id: str) -> Optional[Dict[str, Any]]:
        """Return a stored review, if present."""
        try:
            review = await self.ai_reviews.find_one({"reportId": report_id})
            if review:
                review["_id"] = str(review["_id"])
            return review
        except Exception:
            logger.exception("Unable to load stored review reportId=%s", report_id)
            return None


def get_review_service(
    db: AsyncIOMotorDatabase = Depends(get_database),
) -> ReviewService:
    """FastAPI dependency provider using the shared Motor database."""
    return ReviewService(db)

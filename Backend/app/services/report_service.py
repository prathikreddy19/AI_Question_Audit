import logging
import random
from datetime import datetime, timezone
from typing import Any, Dict, List, Optional, Union
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import Depends
from app.database.database import get_database
from app.schemas.report_schema import ReportCreateSchema

logger = logging.getLogger(__name__)


class ReportService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.reports

    async def create_report(
        self, report_data: Union[ReportCreateSchema, Dict[str, Any]]
    ) -> Dict[str, Any]:
        """
        Create a new student defect report in MongoDB.
        Assigns an auto-generated reportId and reportedAt timestamp if not provided.
        """
        if isinstance(report_data, ReportCreateSchema):
            doc = report_data.model_dump(by_alias=True)
        else:
            doc = dict(report_data)

        if not doc.get("reportId"):
            doc["reportId"] = f"R{random.randint(100, 999)}"

        if not doc.get("reportedAt"):
            doc["reportedAt"] = datetime.now(timezone.utc).isoformat()

        result = await self.collection.insert_one(doc)
        doc["_id"] = str(result.inserted_id)
        return doc

    async def get_reports(self, limit: int = 100, skip: int = 0) -> List[Dict[str, Any]]:
        """Retrieve all student reports."""
        cursor = self.collection.find({}).skip(skip).limit(limit)
        reports = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            reports.append(doc)
        return reports

    async def get_reports_by_question(
        self, question_id: str, limit: int = 100, skip: int = 0
    ) -> List[Dict[str, Any]]:
        """Retrieve all reports associated with a specific questionId."""
        cursor = self.collection.find({"questionId": question_id}).skip(skip).limit(limit)
        reports = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            reports.append(doc)
        return reports


def get_report_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> ReportService:
    """FastAPI Dependency injection provider for ReportService."""
    return ReportService(db)

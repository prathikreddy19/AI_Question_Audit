import logging
from typing import Any, Dict, List, Optional
from bson import ObjectId
from motor.motor_asyncio import AsyncIOMotorDatabase
from fastapi import Depends
from app.database.database import get_database

logger = logging.getLogger(__name__)


class QuestionService:
    def __init__(self, db: AsyncIOMotorDatabase):
        self.db = db
        self.collection = db.questions

    async def get_all_questions(self, limit: int = 100, skip: int = 0) -> List[Dict[str, Any]]:
        """Retrieve all questions with pagination."""
        cursor = self.collection.find({}).skip(skip).limit(limit)
        questions = []
        async for doc in cursor:
            doc["_id"] = str(doc["_id"])
            questions.append(doc)
        return questions

    async def get_question(self, question_id: str) -> Optional[Dict[str, Any]]:
        """
        Retrieve a single question by _id or qid.
        Handles both string IDs and BSON ObjectIds.
        """
        conditions: List[Dict[str, Any]] = [
            {"_id": question_id},
            {"qid": question_id},
        ]

        if ObjectId.is_valid(question_id):
            conditions.append({"_id": ObjectId(question_id)})

        doc = await self.collection.find_one({"$or": conditions})
        if doc:
            doc["_id"] = str(doc["_id"])
            return doc
        return None


def get_question_service(db: AsyncIOMotorDatabase = Depends(get_database)) -> QuestionService:
    """FastAPI Dependency injection provider for QuestionService."""
    return QuestionService(db)

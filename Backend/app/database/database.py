import logging
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
from app.core.config import settings

logger = logging.getLogger(__name__)


class Database:
    client: Optional[AsyncIOMotorClient] = None


db = Database()


async def connect_to_mongo() -> None:
    """
    Initialize singleton Motor MongoDB client connection.
    Called during application startup.
    """
    if db.client is None:
        try:
            logger.info("Connecting to MongoDB Atlas (Database: %s)...", settings.DATABASE_NAME)
            db.client = AsyncIOMotorClient(
                settings.MONGODB_URI,
                serverSelectionTimeoutMS=5000,
            )
            logger.info("Motor MongoDB client initialized.")
        except Exception as e:
            logger.error("Error creating Motor client: %s", e)


async def close_mongo_connection() -> None:
    """
    Close singleton Motor MongoDB client connection cleanly.
    Called during application shutdown.
    """
    if db.client is not None:
        logger.info("Closing MongoDB connection...")
        db.client.close()
        db.client = None
        logger.info("MongoDB connection closed.")


def get_database() -> AsyncIOMotorDatabase:
    """
    Expose singleton MongoDB database instance.
    Supports FastAPI Depends(get_database) dependency injection.
    """
    if db.client is None:
        db.client = AsyncIOMotorClient(
            settings.MONGODB_URI,
            serverSelectionTimeoutMS=5000,
        )
    return db.client[settings.DATABASE_NAME]

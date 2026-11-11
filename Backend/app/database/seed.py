import asyncio
import json
import logging
from pathlib import Path
from app.database.database import get_database, close_mongo_connection

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("seed")

DATA_DIR = Path(__file__).resolve().parent.parent / "data"
QUESTIONS_FILE = DATA_DIR / "questions.json"
REPORTS_FILE = DATA_DIR / "reports.json"


async def seed_database() -> None:
    """
    Seed MongoDB with questions and reports from local JSON files.
    Deletes existing collections before bulk insertion.
    Taxonomy is deliberately NOT inserted into MongoDB.
    """
    db = get_database()

    # Verify data files exist
    if not QUESTIONS_FILE.exists():
        raise FileNotFoundError(f"Questions data file not found at {QUESTIONS_FILE}")
    if not REPORTS_FILE.exists():
        raise FileNotFoundError(f"Reports data file not found at {REPORTS_FILE}")

    # Read data files
    logger.info("Reading questions from %s...", QUESTIONS_FILE)
    with open(QUESTIONS_FILE, "r", encoding="utf-8") as f:
        questions_data = json.load(f)

    logger.info("Reading reports from %s...", REPORTS_FILE)
    with open(REPORTS_FILE, "r", encoding="utf-8") as f:
        reports_data = json.load(f)

    # 1. Delete existing questions collection before inserting
    logger.info("Dropping existing 'questions' collection...")
    await db.questions.drop()

    # 2. Delete existing reports collection before inserting
    logger.info("Dropping existing 'reports' collection...")
    await db.reports.drop()

    # 3. Bulk insert questions
    questions_count = 0
    if questions_data:
        res_q = await db.questions.insert_many(questions_data)
        questions_count = len(res_q.inserted_ids)

    # 4. Bulk insert reports
    reports_count = 0
    if reports_data:
        res_r = await db.reports.insert_many(reports_data)
        reports_count = len(res_r.inserted_ids)

    # 5. Print inserted counts
    print(f"Inserted {questions_count} questions into MongoDB.")
    print(f"Inserted {reports_count} reports into MongoDB.")

    # Clean up connection
    await close_mongo_connection()


if __name__ == "__main__":
    asyncio.run(seed_database())

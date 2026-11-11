import asyncio
import json
from app.database.database import get_database

# Fields required by the assignment
REQUIRED_FIELDS = [
    "reportId",
    "questionId",
    "verdict",
    "repair",
    "edit",
    "route",
    "confidence",
    "evidence",
    "student_reply",
]

async def export_results():
    db = get_database()

    cursor = db.ai_reviews.find({})
    reviews = await cursor.to_list(length=None)

    results = []

    for review in reviews:
        filtered = {
            field: review.get(field)
            for field in REQUIRED_FIELDS
        }
        results.append(filtered)

    with open("results.json", "w", encoding="utf-8") as f:
        json.dump(results, f, indent=2, ensure_ascii=False)

    print(f"✅ Exported {len(results)} reviews to results.json")

if __name__ == "__main__":
    asyncio.run(export_results())
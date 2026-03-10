from fastapi import APIRouter, HTTPException
from datetime import datetime
import random
import uuid
from database import typing_analyses_collection
from models.schemas import TypingData
from services.typing_service import extract_typing_features

router = APIRouter()

GUEST_USER_ID = "guest"

TYPING_TEST_TEXTS = [
    "The quick brown fox jumps over the lazy dog near the river bank on a sunny afternoon.",
    "Technology is changing the world rapidly and creating new opportunities for everyone.",
    "Regular exercise and a balanced diet contribute greatly to maintaining good health.",
    "The early detection of neurological diseases can significantly improve patient outcomes.",
    "Artificial intelligence is being used to solve complex problems in medicine and science.",
    "Speech and typing patterns can reveal subtle signs of neurological changes over time.",
    "Early diagnosis of movement disorders allows doctors to begin treatment much sooner.",
]


@router.get("/test-text")
async def get_test_text():
    text = random.choice(TYPING_TEST_TEXTS)
    return {"text": text, "word_count": len(text.split())}


@router.post("/analyze")
async def analyze_typing(data: TypingData):
    if len(data.keystrokes) < 5:
        raise HTTPException(
            status_code=400,
            detail="Not enough keystroke data. Please type the full paragraph.",
        )

    features = extract_typing_features(
        data.keystrokes,
        data.target_text,
        data.typed_text,
    )

    now = datetime.utcnow()
    doc = {
        "user_id":         GUEST_USER_ID,
        "features":        features,
        "keystroke_count": len(data.keystrokes),
        "target_text":     data.target_text,
        "typed_text":      data.typed_text,
        "total_time_ms":   data.end_time - data.start_time,
        "created_at":      now,
    }

    # Best-effort DB save — result is still returned if DB is unavailable
    analysis_id = str(uuid.uuid4())
    try:
        result = await typing_analyses_collection.insert_one(doc)
        analysis_id = str(result.inserted_id)
    except Exception:
        pass  # DB unavailable — use fallback UUID

    return {
        "id":              analysis_id,
        "user_id":         GUEST_USER_ID,
        "features":        features,
        "keystroke_count": len(data.keystrokes),
        "created_at":      now.isoformat(),
        "message":         "Typing analysis complete",
    }


@router.get("/history")
async def get_typing_history():
    cursor = typing_analyses_collection.find(
        {"user_id": GUEST_USER_ID}
    ).sort("created_at", -1).limit(20)

    analyses = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        doc["created_at"] = doc["created_at"].isoformat()
        analyses.append(doc)

    return {"analyses": analyses, "total": len(analyses)}

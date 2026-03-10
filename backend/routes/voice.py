from fastapi import APIRouter, File, UploadFile, HTTPException
from datetime import datetime
import uuid
from database import voice_analyses_collection
from services.voice_service import extract_voice_features

router = APIRouter()

ALLOWED_AUDIO_TYPES = {
    'audio/wav', 'audio/wave', 'audio/x-wav',
    'audio/mpeg', 'audio/mp3',
    'audio/ogg', 'audio/opus',
    'audio/webm', 'video/webm',
    'audio/mp4', 'audio/x-m4a',
    'application/octet-stream',
}
MAX_FILE_SIZE = 25 * 1024 * 1024  # 25 MB
GUEST_USER_ID = "guest"


@router.post("/analyze")
async def analyze_voice(audio: UploadFile = File(...)):
    audio_bytes = await audio.read()

    if len(audio_bytes) == 0:
        raise HTTPException(status_code=400, detail="Audio file is empty.")
    if len(audio_bytes) > MAX_FILE_SIZE:
        raise HTTPException(status_code=413, detail="Audio file exceeds 25 MB limit.")
    if len(audio_bytes) < 500:
        raise HTTPException(status_code=400, detail="Recording too short — please speak for at least 5 seconds.")

    ct = (audio.content_type or "").lower()
    if ct and ct not in ALLOWED_AUDIO_TYPES:
        raise HTTPException(status_code=415, detail=f"Unsupported audio format: {ct}")

    try:
        result = extract_voice_features(audio_bytes)
    except ValueError as e:
        raise HTTPException(status_code=422, detail=str(e))
    except Exception as e:
        raise HTTPException(status_code=422, detail=f"Audio processing failed: {str(e)}")

    now = datetime.utcnow()
    doc = {
        "user_id":     GUEST_USER_ID,
        "features":    result["features"],
        "duration":    result["duration"],
        "sample_rate": result["sample_rate"],
        "filename":    audio.filename or "recording.webm",
        "file_size":   len(audio_bytes),
        "created_at":  now,
    }

    # Best-effort DB save — analysis result is still returned if DB is unavailable
    analysis_id = str(uuid.uuid4())
    try:
        insert_result = await voice_analyses_collection.insert_one(doc)
        analysis_id = str(insert_result.inserted_id)
    except Exception:
        pass  # DB unavailable — use fallback UUID

    return {
        "id":          analysis_id,
        "user_id":     GUEST_USER_ID,
        "features":    result["features"],
        "duration":    result["duration"],
        "sample_rate": result["sample_rate"],
        "created_at":  now.isoformat(),
        "message":     "Voice analysis complete",
    }


@router.get("/history")
async def get_voice_history():
    cursor = voice_analyses_collection.find(
        {"user_id": GUEST_USER_ID},
        {"features.mfcc": 0},
    ).sort("created_at", -1).limit(20)

    analyses = []
    async for doc in cursor:
        doc["id"] = str(doc.pop("_id"))
        doc["created_at"] = doc["created_at"].isoformat()
        analyses.append(doc)

    return {"analyses": analyses, "total": len(analyses)}

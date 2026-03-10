from fastapi import APIRouter, HTTPException
from datetime import datetime
import uuid
from bson import ObjectId
from database import (
    predictions_collection,
    voice_analyses_collection,
    typing_analyses_collection,
)
from models.schemas import PredictionRequest
from services.ml_service import predict
from services.voice_service import normalize_voice_features
from services.typing_service import normalize_typing_features
import numpy as np

router = APIRouter()

GUEST_USER_ID = "guest"


@router.post("/")
async def make_prediction(request: PredictionRequest):
    if not request.voice_analysis_id and not request.typing_analysis_id:
        raise HTTPException(
            status_code=400,
            detail="Provide at least one analysis ID (voice_analysis_id or typing_analysis_id).",
        )

    voice_features_summary  = None
    typing_features_summary = None
    voice_array  = np.zeros(22, dtype=np.float64)
    typing_array = np.zeros(9,  dtype=np.float64)

    # ── Voice ─────────────────────────────────────────────────────────────────
    if request.voice_analysis_id:
        voice_doc = None
        # Try ObjectId lookup; gracefully skip if it's a UUID (DB was unavailable at analysis time)
        try:
            oid = ObjectId(request.voice_analysis_id)
            voice_doc = await voice_analyses_collection.find_one({"_id": oid})
        except Exception:
            pass  # UUID fallback ID — voice_doc stays None, use zero-vector

        if voice_doc:
            vf = voice_doc["features"]
            voice_array = normalize_voice_features(vf)
            voice_features_summary = {
                "jitter":            round(float(vf.get("jitter", 0)), 4),
                "shimmer":           round(float(vf.get("shimmer", 0)), 4),
                "pitch_mean":        round(float(vf.get("pitch_mean", 0)), 2),
                "pitch_std":         round(float(vf.get("pitch_std", 0)), 2),
                "hnr":               round(float(vf.get("hnr", 0)), 2),
                "spectral_centroid": round(float(vf.get("spectral_centroid", 0)), 1),
            }

    # ── Typing ────────────────────────────────────────────────────────────────
    if request.typing_analysis_id:
        typing_doc = None
        try:
            oid = ObjectId(request.typing_analysis_id)
            typing_doc = await typing_analyses_collection.find_one({"_id": oid})
        except Exception:
            pass  # UUID fallback ID — typing_doc stays None, use zero-vector

        if typing_doc:
            tf = typing_doc["features"]
            typing_array = normalize_typing_features(tf)
            typing_features_summary = {
                "typing_speed_wpm":   round(float(tf.get("typing_speed_wpm", 0)), 1),
                "mean_dwell_time":    round(float(tf.get("mean_dwell_time", 0)), 1),
                "std_dwell_time":     round(float(tf.get("std_dwell_time", 0)), 1),
                "mean_flight_time":   round(float(tf.get("mean_flight_time", 0)), 1),
                "error_rate":         round(float(tf.get("error_rate", 0)) * 100, 2),
                "rhythm_consistency": round(float(tf.get("rhythm_consistency", 0)) * 100, 1),
                "pause_count":        int(tf.get("pause_count", 0)),
            }

    # ── ML Prediction ─────────────────────────────────────────────────────────
    try:
        prediction_result = predict(voice_array, typing_array)
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Prediction model error: {str(e)}")

    prediction_result["voice_features_summary"]  = voice_features_summary
    prediction_result["typing_features_summary"] = typing_features_summary

    now = datetime.utcnow()
    doc = {
        "user_id":            GUEST_USER_ID,
        "result":             prediction_result,
        "voice_analysis_id":  request.voice_analysis_id,
        "typing_analysis_id": request.typing_analysis_id,
        "created_at":         now,
    }

    # Best-effort DB save — prediction is still returned if DB is unavailable
    prediction_id = str(uuid.uuid4())
    try:
        ins = await predictions_collection.insert_one(doc)
        prediction_id = str(ins.inserted_id)
    except Exception:
        pass  # DB unavailable — use fallback UUID

    return {
        "id":                 prediction_id,
        "user_id":            GUEST_USER_ID,
        "result":             prediction_result,
        "voice_analysis_id":  request.voice_analysis_id,
        "typing_analysis_id": request.typing_analysis_id,
        "created_at":         now.isoformat(),
    }

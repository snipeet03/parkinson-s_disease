from pydantic import BaseModel, EmailStr, ConfigDict
from typing import Optional, List, Dict, Any
from datetime import datetime


# ─────────────────────────────────────────────
#  User Models
# ─────────────────────────────────────────────

class UserCreate(BaseModel):
    name: str
    email: EmailStr
    password: str
    age: Optional[int] = None
    gender: Optional[str] = None

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)   # Pydantic v2 — replaces orm_mode
    id: str
    name: str
    email: str
    age: Optional[int] = None
    gender: Optional[str] = None
    created_at: datetime

class Token(BaseModel):
    access_token: str
    token_type: str
    user: UserResponse


# ─────────────────────────────────────────────
#  Voice Models
# ─────────────────────────────────────────────

class VoiceFeatures(BaseModel):
    mfcc: List[float] = []
    jitter: float = 0.0
    shimmer: float = 0.0
    pitch_mean: float = 0.0
    pitch_std: float = 0.0
    hnr: float = 0.0
    zero_crossing_rate: float = 0.0
    spectral_centroid: float = 0.0
    spectral_bandwidth: float = 0.0
    rms_energy: float = 0.0

class VoiceAnalysisResponse(BaseModel):
    id: str
    user_id: str
    features: VoiceFeatures
    duration: float
    sample_rate: int
    created_at: datetime


# ─────────────────────────────────────────────
#  Typing Models
# ─────────────────────────────────────────────

class KeystrokeEvent(BaseModel):
    key: str
    press_time: float
    release_time: float

class TypingData(BaseModel):
    keystrokes: List[KeystrokeEvent]
    target_text: str
    typed_text: str
    start_time: float
    end_time: float

class TypingFeatures(BaseModel):
    mean_dwell_time: float = 0.0
    std_dwell_time: float = 0.0
    mean_flight_time: float = 0.0
    std_flight_time: float = 0.0
    typing_speed_wpm: float = 0.0
    typing_speed_cpm: float = 0.0
    error_rate: float = 0.0
    backspace_rate: float = 0.0
    pause_count: int = 0
    rhythm_consistency: float = 0.0

class TypingAnalysisResponse(BaseModel):
    id: str
    user_id: str
    features: TypingFeatures
    created_at: datetime


# ─────────────────────────────────────────────
#  Prediction Models
# ─────────────────────────────────────────────

class PredictionRequest(BaseModel):
    voice_analysis_id: Optional[str] = None
    typing_analysis_id: Optional[str] = None
    # Inline features — used as fallback when DB is unavailable (UUID-format IDs)
    typing_features: Optional[Dict[str, Any]] = None
    voice_features: Optional[Dict[str, Any]] = None

class PredictionResult(BaseModel):
    classification: str                                        # "Healthy" or "Parkinson's Risk"
    confidence: float
    risk_level: str                                            # "Low" | "Medium" | "High"
    voice_risk_score: Optional[float] = None
    typing_risk_score: Optional[float] = None
    combined_risk_score: float
    voice_features_summary: Optional[Dict[str, Any]] = None
    typing_features_summary: Optional[Dict[str, Any]] = None
    recommendations: List[str] = []
    biomarker_flags: Optional[List[Dict[str, Any]]] = None
    model_stats: Optional[Dict[str, Any]] = None

class PredictionResponse(BaseModel):
    id: str
    user_id: str
    result: PredictionResult
    voice_analysis_id: Optional[str] = None
    typing_analysis_id: Optional[str] = None
    created_at: datetime


# ─────────────────────────────────────────────
#  Report Model
# ─────────────────────────────────────────────

class ReportRequest(BaseModel):
    prediction_id: str

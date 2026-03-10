# 🧠 NeuraScan — Early Parkinson's Disease Detection System

**Final Year B.Tech (CSE) Project**  
G H Raisoni College of Engineering & Management, Nagpur  
Session: 2025–26 | Guide: Dr. Minakshee Chandankhede

**Team:** Meghana Kokas · Prutha Acharya · Prathmesh Rajurkar · Navneet Lonare · Rugved Salpekar

---

## 📋 Project Overview

NeuraScan is an AI-powered web application for the **early non-invasive detection of Parkinson's Disease** using two digital biomarkers:

1. **Voice Analysis** — Extracts MFCC, jitter, shimmer, pitch, HNR from voice recordings
2. **Typing Dynamics** — Captures keystroke timing (dwell time, flight time, rhythm, speed) as motor biomarkers

A trained ensemble ML model (SVM + Random Forest) combines both biomarkers to classify users as **Healthy** or **Parkinson's Risk** with a confidence score.

---

## 🏗️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React.js (Vite) + TailwindCSS + Recharts |
| **Backend** | Python FastAPI |
| **Database** | MongoDB (via Motor async driver) |
| **ML** | Scikit-learn (SVM + Random Forest Ensemble) |
| **Audio** | Librosa (MFCC, pitch, jitter, shimmer extraction) |
| **Reports** | ReportLab (PDF generation) |
| **Auth** | JWT (python-jose) + bcrypt |

---

## 🚀 Setup & Running

### Prerequisites
- Python 3.10+
- Node.js 18+
- MongoDB (running on port 27017)

---

### Backend Setup

```bash
cd backend

# 1. Create virtual environment
python -m venv venv
source venv/bin/activate        # Linux/Mac
# OR
venv\Scripts\activate           # Windows

# 2. Install dependencies
pip install -r requirements.txt

# 3. Copy and configure environment
cp .env.example .env
# Edit .env with your MongoDB URL and secret key

# 4. Train ML model (first time only)
python init_model.py

# 5. Start the API server
uvicorn main:app --reload --port 8000
```

API will be available at: http://localhost:8000  
Interactive docs: http://localhost:8000/docs

---

### Frontend Setup

```bash
cd frontend

# 1. Install dependencies
npm install

# 2. Copy environment
cp .env.example .env

# 3. Start dev server
npm run dev
```

Frontend will be available at: http://localhost:5173

---

## 📁 Project Structure

```
parkinsons-detection/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── database.py                # MongoDB connection
│   ├── init_model.py              # ML model training script
│   ├── requirements.txt
│   ├── models/
│   │   └── schemas.py             # Pydantic request/response models
│   ├── routes/
│   │   ├── auth.py                # POST /auth/register, /auth/login
│   │   ├── voice.py               # POST /voice/analyze
│   │   ├── typing.py              # POST /typing/analyze
│   │   ├── predict.py             # POST /predict/
│   │   └── results.py             # GET /results/history, PDF download
│   ├── services/
│   │   ├── auth_service.py        # JWT, password hashing
│   │   ├── voice_service.py       # Librosa feature extraction
│   │   ├── typing_service.py      # Keystroke feature extraction
│   │   ├── ml_service.py          # SVM + RF ensemble model
│   │   └── report_service.py      # ReportLab PDF generator
│   └── ml/
│       └── model.pkl              # Trained model (generated)
│
└── frontend/
    ├── src/
    │   ├── App.jsx                # Router & auth guard
    │   ├── pages/
    │   │   ├── Landing.jsx        # Home page with project info
    │   │   ├── Auth.jsx           # Login & registration
    │   │   ├── VoiceAnalysis.jsx  # Mic recording & feature display
    │   │   ├── TypingTest.jsx     # Keystroke capture test
    │   │   └── Dashboard.jsx      # Results, charts, PDF download
    │   ├── components/
    │   │   └── Navbar.jsx
    │   ├── hooks/
    │   │   └── useAuth.jsx        # Auth context
    │   └── utils/
    │       └── api.js             # Axios API client
    ├── package.json
    └── tailwind.config.js
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/register` | Register new user |
| POST | `/auth/login` | Login, get JWT token |
| POST | `/voice/analyze` | Upload audio, extract voice features |
| GET | `/voice/history` | Get user's voice analysis history |
| GET | `/typing/test-text` | Get random typing test paragraph |
| POST | `/typing/analyze` | Submit keystroke data, extract features |
| POST | `/predict/` | Run ML prediction (voice + typing) |
| GET | `/results/history` | Get all predictions for user |
| GET | `/results/{id}` | Get specific prediction |
| GET | `/results/{id}/report` | Download PDF medical report |
| DELETE | `/results/{id}` | Delete a result |

---

## 🤖 Machine Learning

### Models
- **SVM** (RBF kernel, C=10) — Excellent for high-dimensional biomarker data
- **Random Forest** (200 trees) — Captures non-linear feature interactions  
- **Voting Ensemble** (soft voting) — Combines both for robustness

### Features Extracted

**Voice (22 features):**
- Jitter (pitch period variation)
- Shimmer (amplitude variation)
- Pitch mean & standard deviation
- Harmonic-to-Noise Ratio (HNR)
- Zero Crossing Rate
- Spectral Centroid & Bandwidth
- RMS Energy
- 13 MFCC coefficients

**Typing (9 features):**
- Mean & Std Dwell Time (key hold duration)
- Mean & Std Flight Time (between key presses)
- Typing Speed (WPM)
- Error Rate (Levenshtein distance)
- Backspace Rate
- Pause Count
- Rhythm Consistency (CV of inter-key intervals)

### Dataset
The system is pre-trained on synthetic data. For production, replace with:
- [UCI Parkinson's Dataset](https://archive.ics.uci.edu/ml/datasets/parkinsons)
- [Parkinson's Speech Dataset](https://archive.ics.uci.edu/ml/datasets/Parkinson+Speech+Dataset+with++Multiple+Types+of+Sound+Recordings)
- Keystroke dynamics datasets from literature

---

## 📊 Key Features

- ✅ Browser-based microphone recording (no software install)
- ✅ Real-time audio waveform visualizer
- ✅ Live keystroke dynamics capture with character-by-character feedback
- ✅ Combined multimodal AI prediction
- ✅ Confidence scores + risk level (Low/Medium/High)
- ✅ Interactive charts: Radar, Bar, Line trend
- ✅ Downloadable PDF medical report
- ✅ Full test history per user
- ✅ JWT-secured API
- ✅ Responsive dark-theme UI

---

## ⚠️ Disclaimer

This application is developed for academic research purposes and is intended as a **screening tool only**. It does **not** constitute medical diagnosis. Users showing elevated risk should consult a qualified neurologist for professional evaluation.

---

## 📚 References

1. Little et al. (2009). Suitability of dysphonia measurements for telemonitoring of Parkinson's disease. *IEEE TBME, 56(4).*
2. Santos et al. (2022). Early Detection using Keystroke Dynamics and ML. *IEEE Access.*
3. Zhang et al. (2022). Deep Learning-Based PD Detection. *Computers in Biology and Medicine, Elsevier.*
4. Rodriguez et al. (2023). Multimodal Digital Biomarkers for Early PD. *NPJ Digital Medicine, Nature.*
5. Chatterjee et al. (2024). Explainable AI for PD Detection. *Expert Systems with Applications, Elsevier.*
6. Lee et al. (2025). AI-Based Digital Biomarkers from Typing. *Artificial Intelligence in Medicine, Elsevier.*

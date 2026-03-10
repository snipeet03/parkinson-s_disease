from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from routes import voice, typing, predict, results   # auth removed
from database import create_indexes
import uvicorn

@asynccontextmanager
async def lifespan(app: FastAPI):
    await create_indexes()
    yield

app = FastAPI(
    title="NeuraScan — Parkinson's Early Detection API",
    description="AI-powered early detection of Parkinson's Disease using voice and typing biomarkers",
    version="2.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:5174", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:5174"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# No auth router — all endpoints are public
app.include_router(voice.router,   prefix="/voice",   tags=["Voice Analysis"])
app.include_router(typing.router,  prefix="/typing",  tags=["Typing Analysis"])
app.include_router(predict.router, prefix="/predict", tags=["Prediction"])
app.include_router(results.router, prefix="/results", tags=["Results"])

@app.get("/")
async def root():
    return {"message": "NeuraScan Parkinson's Detection API", "status": "running", "version": "2.0.0"}

@app.get("/health")
async def health():
    return {"status": "healthy", "version": "2.0.0"}

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)

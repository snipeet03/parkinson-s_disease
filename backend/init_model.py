#!/usr/bin/env python3
"""
Train and initialize the ML model before starting the server.
Run this once before first launch.
"""
import sys
import os

sys.path.insert(0, os.path.dirname(__file__))

from services.ml_service import train_and_save_model

if __name__ == "__main__":
    print("=" * 50)
    print("NeuraScan - Parkinson's Detection System")
    print("Initializing ML Model...")
    print("=" * 50)
    model = train_and_save_model()
    print("=" * 50)
    print("✅ Model trained and saved successfully!")
    print("Run: uvicorn main:app --reload --port 8000")
    print("=" * 50)

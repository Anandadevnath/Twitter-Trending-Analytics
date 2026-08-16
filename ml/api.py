"""
api.py - FastAPI ML Prediction & Benchmarking Service
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Dict, Any
import os
import json
from predict import predict_comprehensive, load_artifacts

app = FastAPI(title="Twitter Trending ML API", version="2.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

model, tfidf, scaler, df = load_artifacts()

class PredictionInput(BaseModel):
    tag: str
    year: int
    tweets: int
    rank: int

@app.post("/predict")
def predict(input: PredictionInput):
    result = predict_comprehensive(
        tag=input.tag,
        year=input.year,
        tweets=input.tweets,
        rank=input.rank,
        model=model,
        tfidf=tfidf,
        scaler=scaler,
        df=df
    )
    return result

@app.get("/benchmark")
def get_benchmark():
    benchmark_path = os.path.join(os.path.dirname(__file__), 'model_benchmark.json')
    if os.path.exists(benchmark_path):
        with open(benchmark_path, 'r') as f:
            return json.load(f)
    return {"error": "Benchmark data not found. Run train.py first."}

@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}

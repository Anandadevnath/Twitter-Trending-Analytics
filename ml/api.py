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
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

models, lifespan_regressor, tfidf, scaler, df = load_artifacts()

class PredictionInput(BaseModel):
    tag: str
    year: int
    tweets: int
    rank: int
    model_name: str = "Random Forest"

@app.post("/predict")
def predict(input: PredictionInput):
    # Select active model or fallback to first available
    active_model = models.get(input.model_name) or next(iter(models.values()))
    result = predict_comprehensive(
        tag=input.tag,
        year=input.year,
        tweets=input.tweets,
        rank=input.rank,
        model=active_model,
        lifespan_regressor=lifespan_regressor,
        tfidf=tfidf,
        scaler=scaler,
        df=df
    )

    # Compute comparison across all models
    comparisons = {}
    for name, m in models.items():
        try:
            res = predict_comprehensive(
                tag=input.tag,
                year=input.year,
                tweets=input.tweets,
                rank=input.rank,
                model=m,
                lifespan_regressor=lifespan_regressor,
                tfidf=tfidf,
                scaler=scaler,
                df=df
            )
            comparisons[name] = {
                'category': res['category'],
                'confidence': res['confidence']
            }
        except Exception:
            pass

    result['comparisons'] = comparisons
    result['active_model'] = input.model_name
    return result

@app.get("/benchmark")
def get_benchmark():
    benchmark_path = os.path.join(os.path.dirname(__file__), 'model_benchmark.json')
    if os.path.exists(benchmark_path):
        with open(benchmark_path, 'r') as f:
            return json.load(f)
    return {"error": "Benchmark data not found. Run train.py first."}

@app.get("/xai/features")
def get_feature_importance():
    benchmark_path = os.path.join(os.path.dirname(__file__), 'model_benchmark.json')
    if os.path.exists(benchmark_path):
        with open(benchmark_path, 'r') as f:
            data = json.load(f)
            return {
                "global_importance": data.get("global_feature_importance", []),
                "confusion_matrices": data.get("confusion_matrices", {}),
                "classes": data.get("classes", [])
            }
    return {"error": "XAI metrics not found."}

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

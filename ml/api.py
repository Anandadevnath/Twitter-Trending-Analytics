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

models, lifespan_regressor, tfidf, scaler, df, all_tag_vecs = load_artifacts()

# Cache benchmark and XAI data in memory on boot
BENCHMARK_DATA = {}
benchmark_path = os.path.join(os.path.dirname(__file__), 'model_benchmark.json')
if os.path.exists(benchmark_path):
    with open(benchmark_path, 'r') as f:
        BENCHMARK_DATA = json.load(f)

class PredictionInput(BaseModel):
    tag: str
    year: int
    tweets: int
    rank: int
    model_name: str = "Random Forest"

@app.post("/predict")
def predict(input: PredictionInput):
    active_model = models.get(input.model_name) or next(iter(models.values()))
    return predict_comprehensive(
        tag=input.tag,
        year=input.year,
        tweets=input.tweets,
        rank=input.rank,
        model=active_model,
        lifespan_regressor=lifespan_regressor,
        tfidf=tfidf,
        scaler=scaler,
        df=df,
        all_tag_vecs=all_tag_vecs,
        all_models=models,
        active_model_name=input.model_name
    )

@app.get("/benchmark")
def get_benchmark():
    if BENCHMARK_DATA:
        return BENCHMARK_DATA
    return {"error": "Benchmark data not found. Run train.py first."}

@app.get("/xai/features")
def get_feature_importance():
    if BENCHMARK_DATA:
        return {
            "global_importance": BENCHMARK_DATA.get("global_feature_importance", []),
            "confusion_matrices": BENCHMARK_DATA.get("confusion_matrices", {}),
            "classes": BENCHMARK_DATA.get("classes", [])
        }
    return {"error": "XAI metrics not found."}

@app.get("/health")
def health():
    return {"status": "ok", "version": "2.0.0"}

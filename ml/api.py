"""
api.py - FastAPI ML Prediction Service

POST /predict - Predicts category and trending level for a hashtag
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from predict import predict_category, load_model

app = FastAPI(title="Twitter Trending ML API")

# Allow React/Express to call this API
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Load model once at startup
model, tfidf = load_model()

class PredictionInput(BaseModel):
    tag: str
    year: int
    tweets: int
    rank: int

class PredictionOutput(BaseModel):
    category: str
    trending_level: str

@app.post("/predict", response_model=PredictionOutput)
def predict(input: PredictionInput):
    result = predict_category(
        tag=input.tag,
        year=input.year,
        tweets=input.tweets,
        rank=input.rank,
        model=model,
        tfidf=tfidf
    )
    return result

@app.get("/health")
def health():
    return {"status": "ok"}

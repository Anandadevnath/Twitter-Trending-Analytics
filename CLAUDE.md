# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working in this repository.

## Overview

Full-stack Twitter trending hashtag analytics: a Python ML pipeline (scikit-learn Random Forest, TF-IDF), a FastAPI ML microservice, a Node/Express + MongoDB backend, and a React/Vite frontend. Repo root contains three subprojects: `ml/`, `backend/`, `frontend/`. See `README.md` for full docs.

## Three services — run in separate terminals

| Service | Port | Start command |
|---|---|---|
| FastAPI ML API | 8000 | `cd ml && source venv/bin/activate && uvicorn api:app --reload --port 8000` |
| Node/Express backend | 5000 | `cd backend && npm run dev` |
| React/Vite frontend | 3000 | `cd frontend && npm run dev` |

Frontend proxies `/api` → backend and `/ml` → ML API via `frontend/vite.config.js` (targets from `VITE_API_URL` / `VITE_ML_URL` in `frontend/.env`).

## Environment variables

- `backend/.env`: `MONGODB_URI`, `PORT=5000`, `FASTAPI_URL=http://localhost:8000`. The committed `.env` points at a MongoDB Atlas cluster (`mongodb+srv://...`).
- `frontend/.env`: `VITE_API_URL` (defaults to a Vercel-deployed backend) and `VITE_ML_URL` (defaults to a Render-deployed ML API).
- Recent commits made API base URLs env-var required with deploy fallbacks — read `backend/server.js` and `frontend/vite.config.js` before assuming localhost.

## ML pipeline (one-time / retraining)

```bash
cd ml && source venv/bin/activate
python preprocess.py   # clean data + rule-based category/trending_level labels
python eda.py           # 8 charts -> ml/visualizations/
python train.py         # trains model, writes model.pkl, evaluation_results.json, model_benchmark.json
```

Artifacts (`model.pkl`, `models.pkl`, `tfidf_vectorizer.pkl`, `scaler.pkl`, `lifespan_regressor.pkl`) are committed under `ml/`. `ml/api.py` loads them at boot via `predict.load_artifacts()`, which precomputes the full-dataset TF-IDF matrix once for similarity lookups. Inference entry point: `POST /predict` in `ml/api.py`, logic in `ml/predict.py`.

## Backend (Node/Express)

- `backend/server.js` — entry, mounts `/api/trends`, `/api/analytics`, `/api/health`, connects Mongoose.
- `backend/models/Trend.js` — Mongoose schema.
- `backend/controllers/trendController.js` — MongoDB aggregation logic.
- `backend/routes/trends.js`, `backend/routes/analytics.js` — REST endpoints (paginated search/filter, top trends, per-year, search-by-tag, analytics aggregates).
- `backend/importData.js` — `npm run import` ingests the cleaned CSV into MongoDB.

## Frontend (React 18 + Vite + Recharts)

- `frontend/src/pages/`: `Dashboard`, `Analytics`, `Hashtags`, `Prediction`, `About`.
- `frontend/src/api.js` — axios wrappers; `API` for trends, `ML_API` for predictions/benchmark/XAI.
- `frontend/vite.config.js` — dev proxies `/api` and `/ml`.

## Conventions

- Backend: CommonJS, Express, Mongoose.
- ML: Python 3.12, scikit-learn ≥1.5, FastAPI 0.115, joblib.
- Category labels are rule-based keyword mappings (Politics/Sports/Entertainment/Technology/Holiday/Social/Other) — not native to the raw dataset.
- Trending levels are tweet-volume thresholds: Low <100k, Medium <1M, High <10M, Viral ≥10M.

## Deployment

Backend deploys to Vercel (`backend/vercel.json`, `server.js` exports `app` for serverless). ML API deploys via `ml/vercel.json`. Frontend is a Vite SPA built with `npm run build`.
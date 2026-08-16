# 📊 Twitter Trending Hashtag Analytics & ML Classification

[![Python](https://img.shields.io/badge/Python-3.10%2B-blue.svg)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.115%2B-009688.svg)](https://fastapi.tiangolo.com/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.5%2B-F7931E.svg)](https://scikit-learn.org/)
[![Node.js](https://img.shields.io/badge/Node.js-18%2B-339933.svg)](https://nodejs.org/)
[![Express.js](https://img.shields.io/badge/Express.js-4.21-000000.svg)](https://expressjs.com/)
[![React](https://img.shields.io/badge/React-18.3-61DAFB.svg)](https://react.dev/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas%20%2F%20Local-47A248.svg)](https://www.mongodb.com/)
[![Vite](https://img.shields.io/badge/Vite-5.4-646CFF.svg)](https://vitejs.dev/)

An end-to-end full-stack machine learning application that analyzes over 12,000 historical Twitter/X trending hashtags (2020–2025), performs automated exploratory data analysis, trains a Random Forest text & metadata classifier, and exposes real-time analytics and predictions through a modern MERN dashboard and a FastAPI microservice.

---

## 📌 Table of Contents

- [Project Overview](#-project-overview)
- [System Architecture](#-system-architecture)
- [Dataset Details](#-dataset-details)
- [Data Preprocessing & Labeling](#-data-preprocessing--labeling)
- [Exploratory Data Analysis (EDA)](#-exploratory-data-analysis-eda)
- [Machine Learning Pipeline](#-machine-learning-pipeline)
- [Trending Level Classification](#-trending-level-classification)
- [Tech Stack](#-tech-stack)
- [Project Directory Structure](#-project-directory-structure)
- [API Reference](#-api-reference)
  - [Express Backend (Port 5000)](#express-backend-port-5000)
  - [FastAPI ML Microservice (Port 8000)](#fastapi-ml-microservice-port-8000)
- [Installation & Setup](#-installation--setup)
- [Running the Application](#-running-the-application)
- [Frontend Pages & UI Features](#-frontend-pages--ui-features)
- [Future Roadmap](#-future-roadmap)
- [Author](#-author)

---

## 📖 Project Overview

### Problem Statement
Twitter/X surfaces thousands of viral hashtags daily, but raw trending metadata lacks standardized topic categorizations. This makes it difficult for researchers, digital marketers, and analysts to aggregate trends by domain (Politics, Sports, Tech, etc.) or gauge viral momentum programmatically.

### Solution
This project delivers a complete pipeline:
1. **Ingestion & Data Cleaning:** Cleans 12,036 raw trending records.
2. **Rule-Based Ground Truth Generation:** Establishes categorical labels via robust keyword mapping.
3. **ML Classification:** Extracts TF-IDF text features combined with numerical engagement metrics to train a `RandomForestClassifier` with **90.61% accuracy**.
4. **Microservice Serving:** FastAPI serves predictions from serialized `.pkl` models.
5. **Analytics & Storage:** Express.js + MongoDB power paginated search, filtering, and aggregation pipelines.
6. **Interactive UI:** Vite-powered React dashboard featuring Recharts visualizations, interactive hashtag explorer, and live ML inference playground.

---

## 🏛 System Architecture

```text
                     +---------------------------------------------+
                     |        Hugging Face Dataset (CSV)           |
                     +---------------------------------------------+
                                            |
                                            v
                     +---------------------------------------------+
                     |          Python Preprocessing & EDA         |
                     |  - Missing value removal & type casting     |
                     |  - Rule-based category labeling             |
                     |  - Project-defined trending levels          |
                     |  - Matplotlib visualizations                |
                     +---------------------------------------------+
                                            |
                                            v
                     +---------------------------------------------+
                     |         Scikit-Learn ML Training            |
                     |  - TF-IDF Vectorizer (500 text features)    |
                     |  - Metadata features (tweets, rank, date)   |
                     |  - RandomForestClassifier (80/20 Stratified)|
                     |  - Serialized model.pkl & tfidf.pkl         |
                     +---------------------------------------------+
                                    /               \
                                   /                 \
                                  v                   v
            +------------------------+     +------------------------+
            |  FastAPI Microservice  |     |  MongoDB Database      |
            |  - Port 8000           |     |  - Document storage    |
            |  - POST /predict       |     |  - Aggregation indexes |
            +------------------------+     +------------------------+
                        ^                              ^
                        |                              |
                        | (Inference proxy)            | (CRUD / Aggs)
                        |                              |
                        +--------------+---------------+
                                       |
                     +---------------------------------------------+
                     |            Node.js / Express Backend        |
                     |  - Port 5000                                |
                     |  - RESTful Analytics & Search APIs          |
                     |  - MongoDB ODM (Mongoose)                   |
                     +---------------------------------------------+
                                            ^
                                            | (JSON / REST)
                                            v
                     +---------------------------------------------+
                     |            React + Vite Frontend            |
                     |  - Port 3000                                |
                     |  - Recharts Visualizations                  |
                     |  - Paginated Hashtags Explorer & Filters    |
                     |  - Interactive ML Inference UI              |
                     +---------------------------------------------+
```

---

## 📊 Dataset Details

- **Dataset Source:** [Hugging Face: ronantakizawa/twitter-trending-hashtags](https://huggingface.co/datasets/ronantakizawa/twitter-trending-hashtags)
- **Total Records:** 12,036 rows
- **Temporal Range:** 2020 – 2025
- **Original Schema:**

| Column | Type | Description |
|---|---|---|
| `tag` | String | Hashtag / Trend name |
| `year` | Integer | Year the trend was recorded (2020–2025) |
| `peak_date` | String (YYYY-MM-DD) | Date when the trend hit peak volume |
| `tweets` | Integer | Total tweet volume recorded |
| `rank` | Integer | Trend position rank (1 = highest) |

---

## 🧹 Data Preprocessing & Labeling

### 1. Data Cleaning
- Parsed `peak_date` into ISO-8601 `datetime` objects.
- Filtered null values, empty entries, and malformed rows.
- Preserved the raw dataset untouched; generated `twitter-trending-hashtags-cleaned.csv`.

### 2. Rule-Based Category Labeling
Because the original dataset does not contain topic classifications, ground-truth labels were engineered using deterministic keyword dictionaries across 7 distinct categories:

- **Politics:** `Trump`, `Biden`, `Election`, `Congress`, `Zelensky`, `Senate`, `Debate`, `Iran`, `Gaza`, etc.
- **Sports:** `Messi`, `Ronaldo`, `NBA`, `NFL`, `Arsenal`, `Super Bowl`, `F1`, `World Cup`, etc.
- **Entertainment:** `Taylor`, `Kanye`, `Drake`, `Netflix`, `Marvel`, `Oscar`, `BTS`, `Grammy`, etc.
- **Technology:** `iPhone`, `ChatGPT`, `OpenAI`, `Grok`, `Bitcoin`, `Tesla`, `Nvidia`, `AI`, etc.
- **Holiday:** `Christmas`, `Thanksgiving`, `Halloween`, `New Year`, `Easter`, `Valentine`, etc.
- **Social:** `BlackLivesMatter`, `COVID`, `Climate`, `MentalHealth`, `Disaster`, `Pride`, etc.
- **Other:** Unmatched hashtags default to `Other`.

> ⚠️ **Disclaimer:** Category labels are generated through a rule-based keyword approach for training purposes and are not native to Twitter's raw dataset.

---

## 📈 Exploratory Data Analysis (EDA)

The automated script (`ml/eda.py`) generates 8 publication-ready charts saved to `ml/visualizations/`:

1. **`1_hashtags_by_year.png`** — Total trend count distribution per year.
2. **`2_tweets_by_year.png`** — Aggregate tweet volume per year (showing huge surges in 2025).
3. **`3_top10_by_tweets.png`** — Top 10 most viral hashtags by raw tweet count (led by `Kanye`, `Happy New Year`, `Trump`).
4. **`4_top10_by_rank.png`** — Highest-ranked trending hashtags.
5. **`5_tweet_distribution.png`** — Skewness and frequency distribution of tweet counts.
6. **`6_rank_distribution.png`** — Frequency distribution across rank positions.
7. **`7_monthly_frequency.png`** — Seasonality and monthly trend frequency.
8. **`8_category_distribution.png`** — Frequency breakdown across all 7 categories.

---

## 🤖 Machine Learning Pipeline

### Feature Engineering
- **Text Features:** `TfidfVectorizer(max_features=500, lowercase=True)` extracting unigrams/n-grams from hashtag tokens.
- **Metadata Features:** `tweets`, `rank`, `tag_length`, `word_count`, `month`, `day_of_week`, `year`.
- **Feature Matrix:** Combined sparse matrix `X = [TF-IDF (500) | Numerical (7)]`.

### Model Selection & Training
- **Algorithm:** `RandomForestClassifier(n_estimators=100, random_state=42, n_jobs=-1)`
- **Data Split:** 80% Training (9,628 rows) / 20% Testing (2,408 rows) using stratified sampling.

### Model Evaluation Results

| Metric | Score |
|---|---|
| **Accuracy** | **90.61%** |
| **Weighted Precision** | **89.87%** |
| **Weighted Recall** | **90.61%** |
| **Weighted F1-Score** | **87.49%** |

#### Classification Report:
```text
               precision    recall  f1-score   support
Entertainment       0.82      0.11      0.20        80
      Holiday       0.95      0.78      0.86        27
        Other       0.91      1.00      0.95      2135
     Politics       0.67      0.10      0.18        78
       Social       1.00      0.09      0.17        22
       Sports       0.93      0.25      0.39        53
   Technology       1.00      0.08      0.14        13

     accuracy                           0.91      2408
    macro avg       0.90      0.34      0.41      2408
 weighted avg       0.90      0.91      0.87      2408
```

---

## ⚡ Trending Level Classification

Hashtag virality is categorized using project-defined tweet volume thresholds:

| Level | Tweet Threshold | Description |
|---|---|---|
| **Low** | `< 100,000` | Standard localized trend |
| **Medium** | `100,000` to `< 1,000,000` | Notable regional / topic trend |
| **High** | `1,000,000` to `< 10,000,000` | Major national / global trending topic |
| **Viral** | `≥ 10,000,000` | Mega-event virality (e.g. Elections, World Cup, New Year) |

---

## 💻 Tech Stack

### Machine Learning & Data Science
- **Python 3.12**
- **Pandas** & **NumPy** — Data manipulation & linear algebra
- **Matplotlib** — Data visualization & static chart generation
- **Scikit-Learn** — Feature extraction (TF-IDF), Random Forest classifier, metrics
- **Joblib** — Model serialization (`model.pkl`, `tfidf_vectorizer.pkl`)

### Microservices & Backend
- **FastAPI** & **Uvicorn** — Python ASGI inference server
- **Node.js** & **Express.js** — Core application backend & API Gateway
- **MongoDB** & **Mongoose** — Document database for trend analytics

### Frontend & UI
- **React 18** (Vite SPA)
- **React Router v6** — Client-side navigation
- **Recharts** — Declarative SVG charts & dynamic visualizations
- **Axios** — HTTP client
- **Modern Responsive CSS** — Custom clean theme with card grids & badges

---

## 📁 Project Directory Structure

```text
twitter_project/
├── ml/
│   ├── data/
│   │   ├── twitter-trending-hashtags.csv         # Raw Hugging Face dataset
│   │   └── twitter-trending-hashtags-cleaned.csv # Preprocessed dataset
│   ├── visualizations/                           # Generated EDA charts (8 PNGs)
│   ├── venv/                                     # Python virtual environment
│   ├── preprocess.py                             # Cleaning & rule-based labeling script
│   ├── eda.py                                    # EDA visualization generator
│   ├── train.py                                  # Random Forest training & evaluation
│   ├── predict.py                                # Inference utility functions
│   ├── api.py                                    # FastAPI microservice
│   ├── model.pkl                                 # Trained model weights
│   ├── tfidf_vectorizer.pkl                      # Fitted TF-IDF vectorizer
│   ├── evaluation_results.json                   # Evaluation metrics
│   └── requirements.txt                          # Python dependencies
│
├── backend/
│   ├── models/
│   │   └── Trend.js                              # Mongoose Trend Schema
│   ├── controllers/
│   │   └── trendController.js                    # API controller logic & MongoDB aggs
│   ├── routes/
│   │   ├── trends.js                             # Routes for /api/trends
│   │   └── analytics.js                          # Routes for /api/analytics
│   ├── importData.js                             # MongoDB ETL import script
│   ├── server.js                                 # Express application entry point
│   ├── package.json                              # Node backend dependencies & scripts
│   └── .env                                      # Environment variables (MongoDB URI, Port)
│
├── frontend/
│   ├── src/
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx                     # KPI metrics & aggregate charts
│   │   │   ├── Analytics.jsx                     # Deep-dive distributions & breakdown
│   │   │   ├── Hashtags.jsx                      # Search, filters, table & pagination
│   │   │   ├── Prediction.jsx                    # Interactive ML prediction interface
│   │   │   └── About.jsx                         # Project architecture & documentation
│   │   ├── App.jsx                               # Navbar & route configuration
│   │   ├── api.js                                # Axios endpoints wrapper
│   │   ├── index.css                             # Global styles & layout design system
│   │   └── main.jsx                              # React DOM mount
│   ├── index.html
│   ├── vite.config.js                            # Vite config with API proxy
│   └── package.json                              # Frontend dependencies
│
├── .gitignore                                    # Ignores node_modules, venv, .env, etc.
└── README.md                                     # Project documentation
```

---

## 🔌 API Reference

### Express Backend (Port 5000)

| Method | Endpoint | Query / Param | Description |
|---|---|---|---|
| `GET` | `/api/trends` | `?page=1&limit=20&year=2025&category=Sports&trending_level=High` | Paginated & filterable list of trends |
| `GET` | `/api/trends/top` | None | Top 10 trends sorted by tweet volume |
| `GET` | `/api/trends/year/:year` | `year` (e.g. `2024`) | Trends for a specific year sorted by rank |
| `GET` | `/api/trends/search/:tag` | `tag` (e.g. `Trump`) | Case-insensitive substring search |
| `GET` | `/api/analytics` | None | Aggregated stats for dashboard & charts |
| `GET` | `/api/health` | None | Service health check |

### FastAPI ML Microservice (Port 8000)

#### `POST /predict`
Predicts hashtag category and trending level from metadata.

**Request Body:**
```json
{
  "tag": "Messi",
  "year": 2026,
  "tweets": 5000000,
  "rank": 15
}
```

**Response Body:**
```json
{
  "category": "Sports",
  "trending_level": "High"
}
```

#### `GET /docs`
Interactive Swagger / OpenAPI documentation is available at `http://localhost:8000/docs`.

---

## 🛠 Installation & Setup

### Prerequisites
- **Python 3.10+**
- **Node.js 18+** & **npm**
- **MongoDB** (Local instance on `mongodb://localhost:27017` or MongoDB Atlas URI)

### 1. Clone the Repository
```bash
git clone https://github.com/Anandadevnath/Twitter-Trending-Analytics.git
cd Twitter-Trending-Analytics
```

### 2. Setup Python ML Environment
```bash
cd ml
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

### 3. Setup Backend
```bash
cd ../backend
npm install
```

Configure `backend/.env`:
```env
MONGODB_URI=mongodb://localhost:27017/twitter_trending
PORT=5000
FASTAPI_URL=http://localhost:8000
```

### 4. Setup Frontend
```bash
cd ../frontend
npm install
```

---

## 🚀 Running the Application

### Step 1: Run Data Pipeline & Train Model (One-time or retraining)
```bash
cd ml
source venv/bin/activate
python preprocess.py    # Cleans data & adds category/trending_level
python eda.py           # Generates 8 visualization charts
python train.py         # Trains Random Forest and outputs model.pkl
```

### Step 2: Ingest Data into MongoDB
```bash
cd ../backend
npm run import
```

### Step 3: Start Services (3 Dedicated Terminals)

**Terminal 1 — FastAPI (ML API):**
```bash
cd ml
source venv/bin/activate
uvicorn api:app --reload --port 8000
```

**Terminal 2 — Node.js / Express Backend:**
```bash
cd backend
npm run dev
```

**Terminal 3 — React Frontend:**
```bash
cd frontend
npm run dev
```

Visit **[http://localhost:3000](http://localhost:3000)** in your browser.

---

## 🖥 Frontend Pages & UI Features

- **Dashboard:** Real-time KPI counters (Total Trends, Years, Max Tweets, Top Trend) and visual analytics (Trends by Year, Total Tweets by Year, Category Distribution, Top 10 Hashtags).
- **Analytics:** In-depth monthly seasonality distributions, trending level proportions, and category breakdowns.
- **Hashtags:** Instant search bar with live detail card, multi-criteria dropdown filters (Year, Category, Level), responsive tabular view, and page-by-page pagination.
- **Prediction:** Interactive machine learning playground where users input any hashtag name, year, target tweet count, and rank to receive real-time classification.
- **About:** Comprehensive documentation outlining dataset provenance, model training setup, labeling rules, and architecture specs.

---

## 🔮 Future Roadmap

- [ ] **Live Twitter/X Stream:** Integrate Twitter API v2 / streaming webhooks for real-time trend ingestion.
- [ ] **Transformer Classification:** Benchmark against lightweight fine-tuned models (e.g. DistilBERT / RoBERTa) for multi-language semantic classification.
- [ ] **Sentiment Analysis:** Add VADER / RoBERTa sentiment scoring per hashtag topic.
- [ ] **Docker Containerization:** Add multi-container `docker-compose.yml` for unified single-command deployment.
- [ ] **User Authentication:** Add JWT-based user authentication and saved custom watchlists.

---

## 👤 Author

**Ananda Devnath**
- GitHub: [@Anandadevnath](https://github.com/Anandadevnath)
- Repository: [Twitter-Trending-Analytics](https://github.com/Anandadevnath/Twitter-Trending-Analytics)

---

## 📄 License

This project is licensed under the MIT License — see the LICENSE file for details.

# Twitter Trending Hashtag Analytics and Classification Using Machine Learning

## 1. Project Introduction

A full-stack application that analyzes Twitter/X trending hashtags and classifies them into categories using Machine Learning (Random Forest). The project includes a Python ML pipeline, FastAPI prediction service, Node.js/Express backend, MongoDB database, and React dashboard.

## 2. Problem Statement

Twitter/X generates thousands of trending hashtags daily, but there is no built-in system to automatically categorize them. This project builds an ML-based classification system to categorize hashtags into meaningful groups like Politics, Sports, Entertainment, etc.

## 3. Objectives

- Analyze Twitter trending hashtag data
- Clean and preprocess the dataset
- Perform Exploratory Data Analysis (EDA)
- Create meaningful categories using rule-based labeling
- Train a Random Forest classifier
- Build a REST API for predictions
- Create a full-stack web dashboard

## 4. Dataset

- **Source:** [Hugging Face - ronantakizawa/twitter-trending-hashtags](https://huggingface.co/datasets/ronantakizawa/twitter-trending-hashtags)
- **File:** `twitter-trending-hashtags.csv`
- **Rows:** ~12,036
- **Years:** 2020-2025

## 5. Dataset Features

| Column | Type | Description |
|--------|------|-------------|
| tag | String | Trending hashtag name |
| year | Integer | Year of trending |
| peak_date | Date | Date when hashtag peaked |
| tweets | Integer | Total tweet count |
| rank | Integer | Trending rank |

## 6. Data Preprocessing

- Converted `peak_date` to datetime
- Removed missing values and duplicates
- Validated `tweets` and `rank` (positive integers only)
- Original CSV preserved; cleaned version saved separately

## 7. Exploratory Data Analysis

Visualizations created:
1. Trending hashtags by year
2. Total tweets by year
3. Top 10 hashtags by tweet count
4. Top 10 hashtags by rank
5. Distribution of tweet counts
6. Distribution of ranks
7. Monthly trending frequency
8. Category distribution

Charts saved in `ml/visualizations/`

## 8. Feature Engineering

Features created for ML:
- `tag_length` - character count of hashtag
- `word_count` - number of words in hashtag
- `month` - month from peak_date
- `day_of_week` - day of week from peak_date
- TF-IDF vectorization of hashtag text (max 500 features)

## 9. Machine Learning Methodology

**Category Labels (Rule-Based):**
Categories were created using keyword matching — NOT from the original dataset:
- **Politics:** Trump, Biden, Election, etc.
- **Sports:** Messi, NBA, Arsenal, etc.
- **Entertainment:** Taylor, Netflix, etc.
- **Technology:** iPhone, Grok, etc.
- **Holiday:** Christmas, Thanksgiving, etc.
- **Social:** COVID, Climate, etc.
- **Other:** Anything not matching above keywords

**Trending Levels (Project-Defined Thresholds — NOT official Twitter/X):**
- Low: < 100,000 tweets
- Medium: 100,000 to < 1,000,000
- High: 1,000,000 to < 10,000,000
- Viral: 10,000,000+

## 10. Random Forest Explanation

Random Forest is an ensemble ML algorithm that:
1. Creates many decision trees (100 in our model)
2. Each tree votes on the category
3. The majority vote wins
4. It handles both text (via TF-IDF) and numerical features
5. It's resistant to overfitting compared to single decision trees

## 11. Model Evaluation

Metrics used:
- **Accuracy** — overall correct predictions
- **Precision** — of predicted positives, how many are correct
- **Recall** — of actual positives, how many were found
- **F1-Score** — harmonic mean of precision and recall
- **Confusion Matrix** — detailed per-class results

Results are saved to `ml/evaluation_results.json` after training.

## 12. Backend Architecture

- **Runtime:** Node.js + Express.js
- **Database:** MongoDB (Mongoose ODM)
- **Port:** 5000

## 13. FastAPI Architecture

- **Runtime:** Python + FastAPI
- **Port:** 8000
- Loads saved `model.pkl` and `tfidf_vectorizer.pkl` at startup

## 14. MongoDB Structure

```javascript
{
  tag: String,
  year: Number,
  peak_date: Date,
  tweets: Number,
  rank: Number,
  category: String,
  trending_level: String
}
```

## 15. React Frontend

Pages:
- **Dashboard** — stat cards + charts
- **Analytics** — detailed analysis charts
- **Hashtags** — searchable table with filters + pagination
- **Prediction** — ML prediction form
- **About** — project information

## 16. API Endpoints

### Express Backend (port 5000)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /api/trends | All trends (paginated + filterable) |
| GET | /api/trends/top | Top 10 by tweets |
| GET | /api/trends/year/:year | Trends by year |
| GET | /api/trends/search/:tag | Search hashtags |
| GET | /api/analytics | Dashboard analytics data |

### FastAPI ML Service (port 8000)
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | /predict | Predict category + trending level |
| GET | /health | Health check |

## 17. How to Install

### Prerequisites
- Python 3.8+
- Node.js 18+
- MongoDB running locally on port 27017

### Step 1: ML Pipeline
```bash
cd ml
pip install -r requirements.txt
```

### Step 2: Backend
```bash
cd backend
npm install
```

### Step 3: Frontend
```bash
cd frontend
npm install
```

## 18. How to Run

### Step 1: Run Python preprocessing & training
```bash
cd ml
python preprocess.py    # Clean data + create features
python eda.py           # Generate visualizations
python train.py         # Train model + save model.pkl
```

### Step 2: Import data into MongoDB
```bash
cd backend
npm run import          # Imports cleaned CSV into MongoDB
```

### Step 3: Start FastAPI (ML predictions)
```bash
cd ml
uvicorn api:app --reload --port 8000
```

### Step 4: Start Express backend
```bash
cd backend
npm run dev
```

### Step 5: Start React frontend
```bash
cd frontend
npm run dev
```

### Access
- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:5000
- **ML API:** http://localhost:8000
- **ML API Docs:** http://localhost:8000/docs

## 19. Screenshots

_(Add screenshots of each page after running the application)_

## 20. Future Improvements

- Add user authentication
- Implement real-time Twitter/X API integration
- Use more advanced NLP for category classification
- Add sentiment analysis
- Deploy to cloud (AWS/Heroku/Vercel)
- Add more visualizations (word clouds, network graphs)
- Implement model retraining pipeline
- Add unit and integration tests

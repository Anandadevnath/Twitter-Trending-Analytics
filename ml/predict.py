"""
predict.py - Prediction helper

Loads saved model and vectorizer, provides predict function.
"""

import joblib
import numpy as np
import scipy.sparse as sp
import os

MODEL_DIR = os.path.dirname(__file__)

def load_model():
    model = joblib.load(os.path.join(MODEL_DIR, 'model.pkl'))
    tfidf = joblib.load(os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl'))
    return model, tfidf

def assign_trending_level(tweets):
    """
    Project-defined thresholds (NOT official Twitter/X classifications).
    """
    if tweets < 100_000:
        return 'Low'
    elif tweets < 1_000_000:
        return 'Medium'
    elif tweets < 10_000_000:
        return 'High'
    else:
        return 'Viral'

def predict_category(tag, year, tweets, rank, model=None, tfidf=None):
    if model is None or tfidf is None:
        model, tfidf = load_model()

    # TF-IDF features from tag
    tfidf_features = tfidf.transform([tag])

    # Numerical features: tweets, rank, tag_length, word_count, month, day_of_week, year
    tag_length = len(tag)
    word_count = len(tag.split())
    month = 1  # default
    day_of_week = 0  # default

    num_features = np.array([[tweets, rank, tag_length, word_count, month, day_of_week, year]])
    X = sp.hstack([tfidf_features, sp.csr_matrix(num_features)])

    category = model.predict(X)[0]
    trending_level = assign_trending_level(tweets)

    return {
        'category': category,
        'trending_level': trending_level
    }

if __name__ == '__main__':
    result = predict_category('Messi', 2026, 5000000, 15)
    print(f"Test prediction: {result}")

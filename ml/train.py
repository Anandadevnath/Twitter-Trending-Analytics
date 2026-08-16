"""
train.py - Robust TF-IDF with Char/Word n-grams, Balanced Random Forest, and Benchmarking
"""

import pandas as pd
import numpy as np
import os
import json
import scipy.sparse as sp
import time

from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.preprocessing import StandardScaler
import joblib

def main():
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'twitter-trending-hashtags-cleaned.csv')
    df = pd.read_csv(data_path)
    df['peak_date'] = pd.to_datetime(df['peak_date'])

    print(f"Loaded dataset: {len(df)} records")

    # 1. High-fidelity TF-IDF (word + char n-grams to capture hashtag sub-tokens)
    tfidf = TfidfVectorizer(
        ngram_range=(1, 3),
        max_features=2500,
        lowercase=True,
        sublinear_tf=True
    )
    tfidf_features = tfidf.fit_transform(df['tag'].fillna(''))

    # Numerical features (log-transform tweets & rank so extreme inputs don't corrupt predictions)
    log_tweets = np.log1p(df['tweets'].values)
    log_rank = np.log1p(df['rank'].values)
    tag_length = df['tag_length'].values
    word_count = df['word_count'].values
    month = df['month'].values
    year = df['year'].values

    raw_num = np.column_stack([log_tweets, log_rank, tag_length, word_count, month, year])
    scaler = StandardScaler()
    scaled_num = scaler.fit_transform(raw_num)

    X = sp.hstack([tfidf_features, sp.csr_matrix(scaled_num)])
    y = df['category']

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    # 2. Models with class_weight='balanced'
    models = {
        'Random Forest': RandomForestClassifier(
            n_estimators=150,
            class_weight='balanced_subsample',
            random_state=42,
            n_jobs=-1
        ),
        'Logistic Regression': LogisticRegression(
            class_weight='balanced',
            max_iter=1000,
            random_state=42
        ),
        'Gradient Boosting': GradientBoostingClassifier(
            n_estimators=80,
            random_state=42
        )
    }

    benchmark_results = []
    trained_models = {}

    for name, m in models.items():
        print(f"Training: {name}...")
        start = time.time()
        m.fit(X_train, y_train)
        pred = m.predict(X_test)
        train_time = round((time.time() - start) * 1000, 2)

        acc = accuracy_score(y_test, pred)
        prec = precision_score(y_test, pred, average='weighted', zero_division=0)
        rec = recall_score(y_test, pred, average='weighted', zero_division=0)
        f1 = f1_score(y_test, pred, average='weighted', zero_division=0)

        benchmark_results.append({
            'name': name,
            'accuracy': round(acc * 100, 2),
            'precision': round(prec * 100, 2),
            'recall': round(rec * 100, 2),
            'f1_score': round(f1 * 100, 2),
            'latency_ms': train_time
        })
        trained_models[name] = m

    best_model = trained_models['Random Forest']

    # Save artifacts
    model_dir = os.path.dirname(__file__)
    joblib.dump(best_model, os.path.join(model_dir, 'model.pkl'))
    joblib.dump(tfidf, os.path.join(model_dir, 'tfidf_vectorizer.pkl'))
    joblib.dump(scaler, os.path.join(model_dir, 'scaler.pkl'))

    metadata = {
        'benchmark': benchmark_results,
        'classes': list(best_model.classes_),
        'total_samples': len(df),
        'test_samples': X_test.shape[0]
    }

    with open(os.path.join(model_dir, 'model_benchmark.json'), 'w') as f:
        json.dump(metadata, f, indent=2)

    print("Model trained and saved with balanced weights.")

if __name__ == '__main__':
    main()

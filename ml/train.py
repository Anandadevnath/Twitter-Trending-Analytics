"""
train.py - Train Random Forest model to predict category

Steps:
1. Load cleaned dataset
2. Feature engineering (TF-IDF on tag + numerical features)
3. Train/test split (80/20)
4. Train RandomForestClassifier
5. Evaluate with accuracy, precision, recall, F1, confusion matrix
6. Save model + vectorizer
"""

import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics import (accuracy_score, precision_score, recall_score,
                             f1_score, classification_report, confusion_matrix)
from sklearn.preprocessing import LabelEncoder
import joblib
import os
import scipy.sparse as sp

def main():
    # Load cleaned data
    data_path = os.path.join(os.path.dirname(__file__), 'data', 'twitter-trending-hashtags-cleaned.csv')
    df = pd.read_csv(data_path)
    df['peak_date'] = pd.to_datetime(df['peak_date'])

    print(f"Dataset: {len(df)} rows")
    print(f"Categories:\n{df['category'].value_counts()}\n")

    # === FEATURES ===

    # TF-IDF on hashtag text (converts text to numbers)
    tfidf = TfidfVectorizer(max_features=500, lowercase=True)
    tfidf_features = tfidf.fit_transform(df['tag'])

    # Numerical features
    num_features = df[['tweets', 'rank', 'tag_length', 'word_count', 'month', 'day_of_week', 'year']].values

    # Combine TF-IDF + numerical features
    X = sp.hstack([tfidf_features, sp.csr_matrix(num_features)])

    # Target
    y = df['category']

    # === TRAIN/TEST SPLIT ===
    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )
    print(f"Training set: {X_train.shape[0]} rows")
    print(f"Test set: {X_test.shape[0]} rows\n")

    # === TRAIN MODEL ===
    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42,
        n_jobs=-1
    )
    model.fit(X_train, y_train)

    # === EVALUATE ===
    y_pred = model.predict(X_test)

    accuracy = accuracy_score(y_test, y_pred)
    precision = precision_score(y_test, y_pred, average='weighted', zero_division=0)
    recall = recall_score(y_test, y_pred, average='weighted', zero_division=0)
    f1 = f1_score(y_test, y_pred, average='weighted', zero_division=0)

    print("=" * 60)
    print("MODEL EVALUATION RESULTS")
    print("=" * 60)
    print(f"Accuracy:  {accuracy:.4f}")
    print(f"Precision: {precision:.4f}")
    print(f"Recall:    {recall:.4f}")
    print(f"F1-Score:  {f1:.4f}")
    print("\nClassification Report:")
    print(classification_report(y_test, y_pred, zero_division=0))
    print("Confusion Matrix:")
    print(confusion_matrix(y_test, y_pred))

    # === SAVE MODEL & VECTORIZER ===
    model_dir = os.path.dirname(__file__)
    joblib.dump(model, os.path.join(model_dir, 'model.pkl'))
    joblib.dump(tfidf, os.path.join(model_dir, 'tfidf_vectorizer.pkl'))
    print(f"\nModel saved to: {os.path.join(model_dir, 'model.pkl')}")
    print(f"TF-IDF vectorizer saved to: {os.path.join(model_dir, 'tfidf_vectorizer.pkl')}")

    # Save evaluation results as JSON for the frontend
    import json
    results = {
        'accuracy': round(accuracy, 4),
        'precision': round(precision, 4),
        'recall': round(recall, 4),
        'f1_score': round(f1, 4),
        'training_rows': X_train.shape[0],
        'test_rows': X_test.shape[0],
        'categories': list(model.classes_)
    }
    with open(os.path.join(model_dir, 'evaluation_results.json'), 'w') as f:
        json.dump(results, f, indent=2)
    print("Evaluation results saved to: evaluation_results.json")

if __name__ == '__main__':
    main()

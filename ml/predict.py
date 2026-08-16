"""
predict.py - Robust Inference matching new Log-Normalized Feature Scaler
"""

import joblib
import numpy as np
import scipy.sparse as sp
import os
import pandas as pd
from sklearn.metrics.pairwise import cosine_similarity

MODEL_DIR = os.path.dirname(__file__)

def load_artifacts():
    model = joblib.load(os.path.join(MODEL_DIR, 'model.pkl'))
    tfidf = joblib.load(os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl'))
    scaler = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))

    # Load cleaned dataset for similarity searches
    data_path = os.path.join(MODEL_DIR, 'data', 'twitter-trending-hashtags-cleaned.csv')
    df = pd.read_csv(data_path)
    return model, tfidf, scaler, df

def assign_trending_level(tweets):
    if tweets < 100_000:
        return 'Low'
    elif tweets < 1_000_000:
        return 'Medium'
    elif tweets < 10_000_000:
        return 'High'
    else:
        return 'Viral'

def estimate_tone(tag, tweets):
    tag_l = tag.lower()
    positive = ['happy', 'love', 'win', 'champion', 'merry', 'peace', 'good', 'joy', 'best', 'award', 'new year', 'bless', 'messi', 'ronaldo']
    critical = ['war', 'crisis', 'ban', 'protest', 'scam', 'fraud', 'arrest', 'indict', 'strike', 'fire', 'rip', 'disaster']

    if any(k in tag_l for k in positive):
        return {'sentiment': 'Positive / Celebratory', 'score': '+0.85', 'color': '#00df8f'}
    elif any(k in tag_l for k in critical):
        return {'sentiment': 'High Urgency / Critical', 'score': '-0.75', 'color': '#ff0055'}
    elif tweets > 5_000_000:
        return {'sentiment': 'Hyper-Active Viral Buzz', 'score': '+0.50', 'color': '#f81ce5'}
    else:
        return {'sentiment': 'Informational / Neutral', 'score': '0.00', 'color': '#888888'}

def find_similar_hashtags(tag, tfidf, df, top_k=4):
    input_vec = tfidf.transform([tag])
    all_vecs = tfidf.transform(df['tag'].fillna(''))
    similarities = cosine_similarity(input_vec, all_vecs).flatten()

    top_indices = similarities.argsort()[::-1]
    results = []
    seen = set([tag.lower()])

    for idx in top_indices:
        match_tag = str(df.iloc[idx]['tag'])
        if match_tag.lower() not in seen:
            sim_score = float(similarities[idx])
            if sim_score > 0:
                seen.add(match_tag.lower())
                results.append({
                    'tag': match_tag,
                    'year': int(df.iloc[idx]['year']),
                    'tweets': int(df.iloc[idx]['tweets']),
                    'category': str(df.iloc[idx]['category']),
                    'similarity': round(sim_score * 100, 1)
                })
        if len(results) >= top_k:
            break

    # If no textual overlap found, match by top volume in category
    if not results:
        sample_df = df[df['tweets'] > 1_000_000].sample(min(top_k, len(df)))
        results = [{
            'tag': str(row['tag']),
            'year': int(row['year']),
            'tweets': int(row['tweets']),
            'category': str(row['category']),
            'similarity': 35.0
        } for _, row in sample_df.iterrows()]

    return results

def predict_comprehensive(tag, year, tweets, rank, model, tfidf, scaler, df):
    # TF-IDF
    tfidf_feat = tfidf.transform([tag])

    # Metadata matching train.py: [log_tweets, log_rank, tag_length, word_count, month, year]
    log_tweets = np.log1p(tweets)
    log_rank = np.log1p(rank)
    tag_length = len(tag)
    word_count = len(tag.split())
    month = 6  # median month

    raw_num = np.array([[log_tweets, log_rank, tag_length, word_count, month, year]])
    scaled_num = scaler.transform(raw_num)

    X = sp.hstack([tfidf_feat, sp.csr_matrix(scaled_num)])

    # Predict class & probabilities
    pred_class = model.predict(X)[0]
    probs = model.predict_proba(X)[0]

    # Category Probabilities sorted descending
    class_probs = []
    for cls, prob in zip(model.classes_, probs):
        class_probs.append({
            'category': cls,
            'confidence': round(float(prob) * 100, 1)
        })
    class_probs = sorted(class_probs, key=lambda x: x['confidence'], reverse=True)

    trending_lvl = assign_trending_level(tweets)
    tone_info = estimate_tone(tag, tweets)
    similar_trends = find_similar_hashtags(tag, tfidf, df, top_k=4)

    return {
        'category': pred_class,
        'confidence': class_probs[0]['confidence'],
        'trending_level': trending_lvl,
        'probabilities': class_probs,
        'tone': tone_info,
        'similar_trends': similar_trends
    }

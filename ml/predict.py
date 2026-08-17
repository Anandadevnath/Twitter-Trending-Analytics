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
    models_path = os.path.join(MODEL_DIR, 'models.pkl')
    if os.path.exists(models_path):
        models = joblib.load(models_path)
    else:
        single_model = joblib.load(os.path.join(MODEL_DIR, 'model.pkl'))
        models = {'Random Forest': single_model}

    # Backward compatibility for scikit-learn version differences on LogisticRegression
    for m in models.values():
        if hasattr(m, '__class__') and m.__class__.__name__ == 'LogisticRegression':
            if not hasattr(m, 'multi_class'):
                m.multi_class = 'auto'

    lifespan_path = os.path.join(MODEL_DIR, 'lifespan_regressor.pkl')
    lifespan_regressor = joblib.load(lifespan_path) if os.path.exists(lifespan_path) else None

    tfidf = joblib.load(os.path.join(MODEL_DIR, 'tfidf_vectorizer.pkl'))
    scaler = joblib.load(os.path.join(MODEL_DIR, 'scaler.pkl'))

    # Load cleaned dataset for similarity searches
    data_path = os.path.join(MODEL_DIR, 'data', 'twitter-trending-hashtags-cleaned.csv')
    df = pd.read_csv(data_path)

    # Precompute TF-IDF matrix for all dataset tags once at startup (prevents re-vectorizing on every query)
    all_tag_vecs = tfidf.transform(df['tag'].fillna(''))

    return models, lifespan_regressor, tfidf, scaler, df, all_tag_vecs

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

def find_similar_hashtags(tag, tfidf, df, all_tag_vecs=None, top_k=4):
    input_vec = tfidf.transform([tag])
    all_vecs = all_tag_vecs if all_tag_vecs is not None else tfidf.transform(df['tag'].fillna(''))
    similarities = cosine_similarity(input_vec, all_vecs).flatten()

    # Fast top-k selection with argpartition instead of full sort
    k_candidates = min(len(similarities), top_k * 5)
    if k_candidates < len(similarities):
        candidate_indices = np.argpartition(similarities, -k_candidates)[-k_candidates:]
        top_indices = candidate_indices[np.argsort(similarities[candidate_indices])[::-1]]
    else:
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

def explain_prediction(tag, tweets, rank, year, model, tfidf, input_vec=None):
    # Reuse input_vec if already computed
    if input_vec is None:
        input_vec = tfidf.transform([tag])
    feature_names = tfidf.get_feature_names_out()
    non_zero_indices = input_vec.indices

    token_weights = []
    for idx in non_zero_indices:
        token = feature_names[idx]
        weight = float(input_vec[0, idx])
        token_weights.append({'token': token, 'weight': round(weight * 100, 1)})

    token_weights = sorted(token_weights, key=lambda x: x['weight'], reverse=True)

    # Metadata feature signals
    meta_signals = [
        {'signal': 'Volume Velocity (Tweets)', 'value': f"{tweets:,}", 'impact': 'High' if tweets > 5000000 else 'Normal'},
        {'signal': 'Peak Rank Standing', 'value': f"#{rank}", 'impact': 'Top Tier' if rank <= 10 else 'Broad'},
        {'signal': 'Year Factor', 'value': str(year), 'impact': 'Current Temporal'}
    ]

    return {
        'tokens': token_weights,
        'signals': meta_signals
    }

def estimate_lifespan(X, lifespan_regressor, tweets, rank):
    if lifespan_regressor:
        pred_hours = float(lifespan_regressor.predict(X)[0])
    else:
        # Fallback heuristic
        pred_hours = float(np.log1p(tweets) * 3.5 + (200 - min(rank, 200)) * 0.15)

    pred_hours = max(2.0, round(pred_hours, 1))

    # Generate decay curve data points for charting: hours vs decay percentage
    decay_curve = []
    for h in [0, 6, 12, 24, 48, 72, 96, 120]:
        retention = max(0.0, round(100.0 * np.exp(-1.5 * h / pred_hours), 1))
        decay_curve.append({'hour': h, 'retention': retention})

    return {
        'expected_active_hours': pred_hours,
        'half_life_hours': round(pred_hours * 0.46, 1),
        'decay_curve': decay_curve
    }

def extract_features(tag, year, tweets, rank, tfidf, scaler):
    """Build sparse feature matrix X and return components for reuse across models."""
    tfidf_feat = tfidf.transform([tag])

    log_tweets = np.log1p(tweets)
    log_rank = np.log1p(rank)
    tag_length = len(tag)
    word_count = len(tag.split())
    month = 6  # median month

    raw_num = np.array([[log_tweets, log_rank, tag_length, word_count, month, year]])
    scaled_num = scaler.transform(raw_num)

    X = sp.hstack([tfidf_feat, sp.csr_matrix(scaled_num)])
    return X, tfidf_feat

def predict_single_model(model, X):
    """Fast prediction and probability extraction for one model given precomputed X."""
    pred_class = model.predict(X)[0]
    try:
        probs = model.predict_proba(X)[0]
    except AttributeError:
        if not hasattr(model, 'multi_class'):
            model.multi_class = 'auto'
        probs = model.predict_proba(X)[0]

    class_probs = [
        {'category': cls, 'confidence': round(float(prob) * 100, 1)}
        for cls, prob in zip(model.classes_, probs)
    ]
    class_probs.sort(key=lambda x: x['confidence'], reverse=True)
    return pred_class, class_probs

def predict_comprehensive(tag, year, tweets, rank, model, lifespan_regressor, tfidf, scaler, df, all_tag_vecs=None, all_models=None, active_model_name='Random Forest'):
    # Extract features once
    X, tfidf_feat = extract_features(tag, year, tweets, rank, tfidf, scaler)

    # Active model prediction
    pred_class, class_probs = predict_single_model(model, X)

    trending_lvl = assign_trending_level(tweets)
    tone_info = estimate_tone(tag, tweets)
    similar_trends = find_similar_hashtags(tag, tfidf, df, all_tag_vecs=all_tag_vecs, top_k=4)
    explanation = explain_prediction(tag, tweets, rank, year, model, tfidf, input_vec=tfidf_feat)
    lifespan = estimate_lifespan(X, lifespan_regressor, tweets, rank)

    # Model comparisons without re-extracting features or re-calculating similar trends
    comparisons = {}
    if all_models:
        for name, m in all_models.items():
            try:
                m_class, m_probs = predict_single_model(m, X)
                comparisons[name] = {
                    'category': m_class,
                    'confidence': m_probs[0]['confidence'] if m_probs else 0.0
                }
            except Exception:
                pass

    return {
        'category': pred_class,
        'confidence': class_probs[0]['confidence'] if class_probs else 0.0,
        'trending_level': trending_lvl,
        'probabilities': class_probs,
        'tone': tone_info,
        'similar_trends': similar_trends,
        'explanation': explanation,
        'lifespan': lifespan,
        'comparisons': comparisons,
        'active_model': active_model_name
    }

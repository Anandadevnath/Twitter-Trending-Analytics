"""
preprocess.py - Data Cleaning & Feature Engineering

This script:
1. Loads the raw CSV dataset
2. Cleans missing/invalid values
3. Creates 'category' using RULE-BASED keyword labeling (NOT from original dataset)
4. Creates 'trending_level' using PROJECT-DEFINED thresholds (NOT official Twitter/X classifications)
5. Saves cleaned dataset as twitter-trending-hashtags-cleaned.csv
"""

import pandas as pd
import numpy as np
import os

def load_data():
    """Load raw CSV dataset"""
    path = os.path.join(os.path.dirname(__file__), 'data', 'twitter-trending-hashtags.csv')
    df = pd.read_csv(path)
    return df

def display_info(df):
    """Display basic dataset information"""
    print("=" * 60)
    print("DATASET INFORMATION")
    print("=" * 60)
    print(f"\nNumber of rows: {len(df)}")
    print(f"Number of columns: {len(df.columns)}")
    print(f"\nColumn names: {list(df.columns)}")
    print(f"\nData types:\n{df.dtypes}")
    print(f"\nMissing values:\n{df.isnull().sum()}")
    print(f"\nDuplicate rows: {df.duplicated().sum()}")
    print(f"\nFirst 10 rows:\n{df.head(10)}")
    print(f"\nBasic statistics:\n{df.describe()}")
    print("=" * 60)

def clean_data(df):
    """Clean the dataset"""
    df = df.copy()

    # Convert peak_date to datetime
    df['peak_date'] = pd.to_datetime(df['peak_date'], errors='coerce')

    # Remove rows with missing values
    df = df.dropna()

    # Remove duplicates
    df = df.drop_duplicates()

    # Ensure tweets and rank are positive integers
    df['tweets'] = pd.to_numeric(df['tweets'], errors='coerce')
    df['rank'] = pd.to_numeric(df['rank'], errors='coerce')
    df = df.dropna(subset=['tweets', 'rank'])
    df = df[df['tweets'] > 0]
    df = df[df['rank'] > 0]
    df['tweets'] = df['tweets'].astype(int)
    df['rank'] = df['rank'].astype(int)

    return df.reset_index(drop=True)

def assign_category(tag):
    """
    RULE-BASED LABELING:
    Categories are assigned using keyword matching.
    These labels were NOT part of the original dataset.
    This is a project-defined classification for ML training purposes.
    """
    tag_lower = tag.lower()

    # Politics keywords
    politics = ['trump', 'biden', 'election', 'vote', 'democrat', 'republican',
                'congress', 'senate', 'president', 'politic', 'impeach', 'gop',
                'liberal', 'conservative', 'maga', 'usaid', 'zelensky', 'putin',
                'obama', 'kamala', 'harris', 'pelosi', 'desantis', 'debate',
                'governor', 'mayor', 'minister', 'parliament', 'brexit',
                'nato', 'un ', 'g7', 'g20', 'sanctions', 'diplomatic',
                'charlie kirk', 'elon', 'epstein', 'iran', 'israel', 'gaza',
                'ukraine', 'russia', 'china', 'taiwan', 'palestine', 'war',
                'coup', 'protest', 'rally', 'capitol', 'scotus', 'roe',
                'abortion', 'gun control', 'border', 'immigra', 'refugee',
                'tariff', 'trade war', 'communis', 'socialis', 'fascis',
                'dictator', 'authorit', 'freedom', 'censor', 'fbi', 'cia',
                'doj', 'indictment', 'arraign', 'verdict', 'guilty',
                'acquit', 'pardon', 'resign', 'recall', 'vance', 'rfk',
                'tulsi', 'haley', 'newsom', 'trudeau', 'macron', 'modi',
                'netanyahu', 'milei', 'lula', 'bolsonaro']

    # Sports keywords
    sports = ['nba', 'nfl', 'mlb', 'nhl', 'fifa', 'ufc', 'wwe',
              'messi', 'ronaldo', 'lebron', 'soccer', 'football',
              'basketball', 'baseball', 'tennis', 'golf', 'cricket',
              'arsenal', 'liverpool', 'chelsea', 'manchester', 'barca',
              'real madrid', 'lakers', 'warriors', 'super bowl', 'superbowl',
              'world cup', 'worldcup', 'champions league', 'premier league',
              'serie a', 'bundesliga', 'la liga', 'olympics', 'olympic',
              'athlete', 'quarterback', 'touchdown', 'goal', 'match',
              'playoff', 'finals', 'championship', 'draft', 'trade',
              'transfer', 'injury', 'copa', 'derby', 'f1 ', 'formula 1',
              'grand prix', 'nascar', 'boxing', 'wrestl', 'rugby',
              'volleyball', 'swim', 'track and field', 'marathon',
              'batting', 'pitcher', 'homerun', 'slam dunk', 'mvp',
              'heisman', 'ballon', 'mahomes', 'curry', 'giannis',
              'mbappé', 'mbappe', 'haaland', 'sport']

    # Entertainment keywords
    entertainment = ['taylor', 'swift', 'beyonce', 'drake', 'kanye',
                     'netflix', 'disney', 'marvel', 'movie', 'film',
                     'music', 'album', 'concert', 'tour', 'grammy',
                     'oscar', 'emmy', 'golden globe', 'award',
                     'celebrity', 'actor', 'actress', 'singer', 'rapper',
                     'anime', 'manga', 'kpop', 'k-pop', 'bts',
                     'blackpink', 'idol', 'star wars', 'batman',
                     'spider', 'avenger', 'game of thrones', 'stranger things',
                     'squid game', 'bridgerton', 'barbie', 'oppenheimer',
                     'deadpool', 'wicked', 'moana', 'frozen',
                     'harry potter', 'lord of the rings', 'hobbit',
                     'tv show', 'series', 'episode', 'season',
                     'premiere', 'trailer', 'release', 'stream',
                     'spotify', 'youtube', 'tiktok', 'viral',
                     'podcast', 'video', 'rihanna', 'adele',
                     'bieber', 'ariana', 'doja', 'bad bunny',
                     'weeknd', 'sza', 'dua lipa', 'billie',
                     'olivia rodrigo', 'kendrick', 'j cole',
                     'travis scott', 'peso pluma', 'karol g',
                     'selena', 'jennifer', 'zendaya', 'timothee']

    # Holiday keywords
    holidays = ['christmas', 'thanksgiving', 'halloween', 'easter',
                'new year', 'valentine', 'independence day', 'july 4',
                '4th of july', 'memorial day', 'labor day',
                'mother', 'father', 'happy 20', 'holiday',
                'merry', 'santa', 'pumpkin', 'costume',
                'firework', 'parade', 'feast', 'turkey day',
                'diwali', 'eid', 'ramadan', 'hanukkah', 'kwanzaa',
                'lunar new year', 'chinese new year', 'april fool',
                'エイプリルフール', 'バレンタイン', 'クリスマス']

    # Technology keywords
    technology = ['iphone', 'apple', 'google', 'microsoft', 'amazon',
                  'ai ', 'chatgpt', 'gpt', 'openai', 'grok',
                  'crypto', 'bitcoin', 'blockchain', 'nft',
                  'metaverse', 'vr ', 'ar ', 'robot', 'tech',
                  'software', 'hardware', 'app ', 'cyber',
                  'hack', 'data', 'cloud', 'startup', 'coding',
                  'programm', 'developer', 'github', 'android',
                  'samsung', 'nvidia', 'tesla', 'spacex',
                  'launch', 'update', 'bug', 'feature',
                  'internet', 'wifi', '5g', 'chip',
                  'semiconductor', 'quantum', 'machine learning',
                  'deep learning', 'neural', 'algorithm']

    # Social keywords
    social = ['blacklivesmatter', 'blm', 'metoo', 'lgbtq', 'pride',
              'equality', 'justice', 'rights', 'mental health',
              'awareness', 'charity', 'donate', 'volunteer',
              'climate', 'environment', 'green', 'sustainability',
              'pandemic', 'covid', 'vaccine', 'lockdown', 'mask',
              'quarantine', 'virus', 'health', 'wellness',
              'education', 'school', 'university', 'student',
              'teacher', 'prayer', 'rip ', 'rest in peace',
              'tribute', 'memorial', 'tragedy', 'disaster',
              'earthquake', 'hurricane', 'flood', 'wildfire',
              'shooting', 'victim', 'survivor', 'community',
              'solidarity', 'support', 'help', 'crisis']

    for keyword in politics:
        if keyword in tag_lower:
            return 'Politics'
    for keyword in sports:
        if keyword in tag_lower:
            return 'Sports'
    for keyword in entertainment:
        if keyword in tag_lower:
            return 'Entertainment'
    for keyword in holidays:
        if keyword in tag_lower:
            return 'Holiday'
    for keyword in technology:
        if keyword in tag_lower:
            return 'Technology'
    for keyword in social:
        if keyword in tag_lower:
            return 'Social'

    return 'Other'

def assign_trending_level(tweets):
    """
    PROJECT-DEFINED trending level thresholds.
    These are NOT official Twitter/X classifications.
    They are created for this project's analysis purposes.

    Thresholds:
    - Low: < 100,000 tweets
    - Medium: 100,000 to < 1,000,000 tweets
    - High: 1,000,000 to < 10,000,000 tweets
    - Viral: 10,000,000+ tweets
    """
    if tweets < 100_000:
        return 'Low'
    elif tweets < 1_000_000:
        return 'Medium'
    elif tweets < 10_000_000:
        return 'High'
    else:
        return 'Viral'

def add_features(df):
    """Add engineered features"""
    df = df.copy()

    # Category (rule-based labeling - NOT from original dataset)
    df['category'] = df['tag'].apply(assign_category)

    # Trending level (project-defined thresholds)
    df['trending_level'] = df['tweets'].apply(assign_trending_level)

    # Additional features for ML
    df['tag_length'] = df['tag'].str.len()
    df['word_count'] = df['tag'].str.split().str.len()
    df['month'] = df['peak_date'].dt.month
    df['day_of_week'] = df['peak_date'].dt.dayofweek

    return df

def main():
    # Load
    df = load_data()
    display_info(df)

    # Clean
    df = clean_data(df)
    print(f"\nAfter cleaning: {len(df)} rows")

    # Add features
    df = add_features(df)

    # Display category distribution
    print("\n" + "=" * 60)
    print("CATEGORY DISTRIBUTION (Rule-based labeling)")
    print("=" * 60)
    print(df['category'].value_counts())

    print("\n" + "=" * 60)
    print("TRENDING LEVEL DISTRIBUTION (Project-defined thresholds)")
    print("=" * 60)
    print(df['trending_level'].value_counts())

    # Save cleaned dataset
    save_path = os.path.join(os.path.dirname(__file__), 'data', 'twitter-trending-hashtags-cleaned.csv')
    df.to_csv(save_path, index=False)
    print(f"\nCleaned dataset saved to: {save_path}")
    print(f"Total rows: {len(df)}, Total columns: {len(df.columns)}")

    return df

if __name__ == '__main__':
    main()
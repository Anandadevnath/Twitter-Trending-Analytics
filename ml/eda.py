"""
eda.py - Exploratory Data Analysis

Creates visualizations and saves them to ml/visualizations/
"""

import pandas as pd
import matplotlib
matplotlib.use('Agg')  # Non-interactive backend
import matplotlib.pyplot as plt
import os

def load_cleaned_data():
    path = os.path.join(os.path.dirname(__file__), 'data', 'twitter-trending-hashtags-cleaned.csv')
    df = pd.read_csv(path)
    df['peak_date'] = pd.to_datetime(df['peak_date'])
    return df

def save_plot(fig, name):
    path = os.path.join(os.path.dirname(__file__), 'visualizations', name)
    fig.savefig(path, dpi=150, bbox_inches='tight')
    plt.close(fig)
    print(f"Saved: {path}")

def run_eda():
    df = load_cleaned_data()
    viz_dir = os.path.join(os.path.dirname(__file__), 'visualizations')
    os.makedirs(viz_dir, exist_ok=True)

    # 1. Number of trending hashtags by year
    fig, ax = plt.subplots(figsize=(10, 6))
    year_counts = df['year'].value_counts().sort_index()
    ax.bar(year_counts.index.astype(str), year_counts.values, color='#3498db')
    ax.set_title('Number of Trending Hashtags by Year', fontsize=14)
    ax.set_xlabel('Year')
    ax.set_ylabel('Count')
    for i, v in enumerate(year_counts.values):
        ax.text(i, v + 10, str(v), ha='center', fontsize=9)
    save_plot(fig, '1_hashtags_by_year.png')
    # Explanation: Shows how many hashtags trended each year. More = more Twitter activity.

    # 2. Total tweets by year
    fig, ax = plt.subplots(figsize=(10, 6))
    tweets_by_year = df.groupby('year')['tweets'].sum().sort_index()
    ax.bar(tweets_by_year.index.astype(str), tweets_by_year.values, color='#e74c3c')
    ax.set_title('Total Tweets by Year', fontsize=14)
    ax.set_xlabel('Year')
    ax.set_ylabel('Total Tweets')
    save_plot(fig, '2_tweets_by_year.png')
    # Explanation: Shows total tweet volume per year. Higher = more engagement.

    # 3. Top 10 hashtags by tweet count
    fig, ax = plt.subplots(figsize=(10, 6))
    top10_tweets = df.nlargest(10, 'tweets')
    ax.barh(top10_tweets['tag'], top10_tweets['tweets'], color='#2ecc71')
    ax.set_title('Top 10 Hashtags by Tweet Count', fontsize=14)
    ax.set_xlabel('Tweets')
    ax.invert_yaxis()
    save_plot(fig, '3_top10_by_tweets.png')
    # Explanation: The most tweeted hashtags ever. These went massively viral.

    # 4. Top 10 hashtags by rank (rank 1 = best)
    fig, ax = plt.subplots(figsize=(10, 6))
    top10_rank = df.nsmallest(10, 'rank')
    ax.barh(top10_rank['tag'], top10_rank['rank'], color='#f39c12')
    ax.set_title('Top 10 Hashtags by Rank (Lower = Better)', fontsize=14)
    ax.set_xlabel('Rank')
    ax.invert_yaxis()
    save_plot(fig, '4_top10_by_rank.png')
    # Explanation: Highest-ranked trending hashtags. Rank 1 = #1 trending.

    # 5. Distribution of tweet counts
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.hist(df['tweets'], bins=50, color='#9b59b6', edgecolor='black', alpha=0.7)
    ax.set_title('Distribution of Tweet Counts', fontsize=14)
    ax.set_xlabel('Tweets')
    ax.set_ylabel('Frequency')
    save_plot(fig, '5_tweet_distribution.png')
    # Explanation: Most hashtags have relatively low tweet counts; a few go viral.

    # 6. Distribution of ranks
    fig, ax = plt.subplots(figsize=(10, 6))
    ax.hist(df['rank'], bins=50, color='#1abc9c', edgecolor='black', alpha=0.7)
    ax.set_title('Distribution of Ranks', fontsize=14)
    ax.set_xlabel('Rank')
    ax.set_ylabel('Frequency')
    save_plot(fig, '6_rank_distribution.png')
    # Explanation: Shows how ranks are spread. Most hashtags have mid-to-high rank numbers.

    # 7. Monthly trending hashtag frequency
    fig, ax = plt.subplots(figsize=(10, 6))
    monthly = df['month'].value_counts().sort_index()
    month_names = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
    ax.bar([month_names[i-1] for i in monthly.index], monthly.values, color='#e67e22')
    ax.set_title('Monthly Trending Hashtag Frequency', fontsize=14)
    ax.set_xlabel('Month')
    ax.set_ylabel('Count')
    save_plot(fig, '7_monthly_frequency.png')
    # Explanation: Shows which months have the most trending hashtags.

    # 8. Category distribution
    fig, ax = plt.subplots(figsize=(10, 6))
    cat_counts = df['category'].value_counts()
    ax.bar(cat_counts.index, cat_counts.values, color=['#3498db','#e74c3c','#2ecc71','#f39c12','#9b59b6','#1abc9c','#e67e22'])
    ax.set_title('Category Distribution (Rule-Based Labels)', fontsize=14)
    ax.set_xlabel('Category')
    ax.set_ylabel('Count')
    plt.xticks(rotation=45)
    for i, v in enumerate(cat_counts.values):
        ax.text(i, v + 10, str(v), ha='center', fontsize=9)
    save_plot(fig, '8_category_distribution.png')
    # Explanation: Shows how many hashtags fall into each category after rule-based labeling.

    print("\nAll visualizations saved to ml/visualizations/")

if __name__ == '__main__':
    run_eda()

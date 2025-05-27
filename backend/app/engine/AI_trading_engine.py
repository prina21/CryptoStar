import praw
import pandas as pd
from datetime import datetime, timezone
from transformers import pipeline, AutoTokenizer
import torch
import os
from dotenv import load_dotenv

MODEL_NAME = "distilbert-base-uncased-finetuned-sst-2-english"
tokenizer = AutoTokenizer.from_pretrained(MODEL_NAME)
device = 0 if torch.cuda.is_available() else -1
sentiment_pipeline = pipeline("sentiment-analysis", model=MODEL_NAME, tokenizer=tokenizer, device=device)
coin = "BTC"

load_dotenv()

REDDIT_API_KEY = os.getenv("REDDIT_API_KEY")
REDDIT_SECRET_KEY = os.getenv("REDDIT_SECRET_KEY")
REDDIT_USER_AGENT = os.getenv("REDDIT_USER_AGENT")

reddit = praw.Reddit(
    client_id=REDDIT_API_KEY,
    client_secret=REDDIT_SECRET_KEY,
    user_agent=REDDIT_USER_AGENT
)

MAX_TOKENS = 512

def fetch_reddit_posts(query=coin, subreddit_name="CryptoCurrency", limit=50):
    subreddit = reddit.subreddit(subreddit_name)
    posts = []

    for post in subreddit.search(query, sort="new", limit=limit):
        full_text = f"{post.title} {post.selftext}"

        # Tokenize and truncate to fit within max length
        inputs = tokenizer(
            full_text,
            max_length=MAX_TOKENS,
            truncation=True,
            return_tensors="pt"
        )
        truncated_text = tokenizer.decode(inputs["input_ids"][0], skip_special_tokens=True)

        posts.append({
            "title": post.title,
            "text": truncated_text,
            "created": datetime.fromtimestamp(post.created_utc, tz=timezone.utc)
        })

    return pd.DataFrame(posts)

def analyze_sentiment(df):
    if df.empty:
        print("No posts to analyze.")
        return df

    results = sentiment_pipeline(df["text"].tolist())
    df["sentiment"] = [res["label"] for res in results]
    df["score"] = [res["score"] for res in results]
    return df

def summarize(df):
    sentiment_counts = df["sentiment"].value_counts(normalize=True) * 100
    print("Sentiment Distribution:\n", sentiment_counts.to_string())

    if sentiment_counts.get("POSITIVE", 0) > 60:
        print("\nOverall sentiment is strongly positive. Consider: BUY")
    elif sentiment_counts.get("NEGATIVE", 0) > 60:
        print("\nOverall sentiment is strongly negative. Consider: SELL")
    else:
        print("\nSentiment is mixed. Consider: HOLD or wait.")

def main():
    print("Fetching Reddit posts...")
    df = fetch_reddit_posts(query=coin)
    if df.empty:
        print("No posts found.")
        return
    df = analyze_sentiment(df)
    summarize(df)

if __name__ == "__main__":
    main()
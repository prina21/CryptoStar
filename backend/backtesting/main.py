from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import pandas as pd
from ta.momentum import RSIIndicator
from ta.trend import EMAIndicator, SMAIndicator
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Enable CORS to allow calls from your React frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Schema for a single rule (buy or sell)
class StrategyRule(BaseModel):
    indicator: str
    condition: str  # "<" or ">"
    value: float
    action: str     # "BUY" or "SELL"

# Full request model
class StrategyRequest(BaseModel):
    buyRule: StrategyRule
    sellRule: StrategyRule
    timeframe: str
    data: List[dict]  # parsed CSV from frontend

@app.post("/backtest")
def backtest_strategy(config: StrategyRequest):
    df = pd.DataFrame(config.data)
    df["close"] = pd.to_numeric(df["close"], errors="coerce")
    df.dropna(subset=["close"], inplace=True)

    # Compute indicators if not present
    for rule in [config.buyRule, config.sellRule]:
        if rule.indicator not in df.columns:
            if rule.indicator == "RSI":
                df["RSI"] = RSIIndicator(close=df["close"], window=14).rsi()
            elif rule.indicator == "EMA":
                df["EMA"] = EMAIndicator(close=df["close"], window=14).ema_indicator()
            elif rule.indicator == "SMA":
                df["SMA"] = df["close"].rolling(window=14).mean()

    signals = []
    balance = 1000.0
    holdings = 0.0
    position = None

    for i in range(len(df)):
        price = df["close"].iloc[i]
        buy_val = df[config.buyRule.indicator].iloc[i]
        sell_val = df[config.sellRule.indicator].iloc[i]
        signal = "HOLD"

        # Check Buy Condition
        if pd.notnull(buy_val) and position is None:
            if config.buyRule.condition == "<" and float(buy_val) < float(config.buyRule.value):
                signal = "BUY"
            elif config.buyRule.condition == ">" and float(buy_val) >float(config.buyRule.value):
                signal = "BUY"

        if signal == "BUY" and position is None:
            holdings = balance / price
            balance = 0
            position = "LONG"

        # Check Sell Condition
        if pd.notnull(sell_val) and position == "LONG":
            if config.sellRule.condition == "<" and float(sell_val) < float(config.sellRule.value):
                signal = "SELL"
            elif config.sellRule.condition == ">" and float(sell_val) > float(config.sellRule.value):
                signal = "SELL"

        if signal == "SELL" and position == "LONG":
            balance = holdings * price
            holdings = 0
            position = None

        signals.append(signal)

    # Final settlement if still holding position
    if position == "LONG":
        balance = holdings * df["close"].iloc[-1]
        holdings = 0

    return {
        "finalBalance": round(balance, 2),
        "holdings": round(holdings, 4),
        "profit": round(balance - 1000, 2),
        "signals": signals
    }

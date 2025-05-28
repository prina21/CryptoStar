import sys
import os

sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))

from fastapi import FastAPI, WebSocket
import requests
from fastapi.middleware.cors import CORSMiddleware
from  backend.routes import portfolio
import websockets
import asyncio
from backend.routes.portfolio import router as portfolio_router
from backend.routes.riskMetrics import router as riskMetrics_router
from fastapi import FastAPI
from pydantic import BaseModel
from typing import List
import pandas as pd
from ta.momentum import RSIIndicator
from ta.trend import EMAIndicator, SMAIndicator
from pydantic import BaseModel
import json
# from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()
print("FastAPI started")

# Enable CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000",],  # Allow requests from frontend
    allow_credentials=True,
    allow_methods=["*"],  # Allow all HTTP methods (GET, POST, etc.)
    allow_headers=["*"],  
)


# Coin Market Cap API
API_KEY = "c84b8c11-38d1-4d79-87cf-e1bdad06ebe9"
HEADERS = {
    "X-CMC_PRO_API_KEY": API_KEY,
    "Accept": "application/json" 
}
BASE_URL = "https://pro-api.coinmarketcap.com/v1/cryptocurrency/listings/latest"

@app.get("/crypto")
def get_crypto():
    response = requests.get(BASE_URL, headers=HEADERS)
    print(response.json)
    return response.json()

@app.get("/api/risk-metrics")
async def get_risk_metrics():
    try:
        # your real logic here
        return {"risk": 0.05, "volatility": 0.12}
    except Exception as e:
        print(f"Error in /api/risk-metrics: {e}")
        return {"error": str(e)}

app.include_router(portfolio_router)
app.include_router(riskMetrics_router)

# @app.websocket("/ws/crypto")
# async def websocket_endpoint(websocket: WebSocket):
#     await websocket.accept()
    
#     binance_url = "wss://stream.binance.us:9443/ws/!ticker@arr"

#     async with websockets.connect(binance_url) as binance_ws:
#         while True:
#             data = await binance_ws.recv()
#             await websocket.send_text(data)


#Backtesting Module
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

#Watchlist
WATCHLIST_FILE = "watchlist.json"

class Coin(BaseModel):
    symbol: str
    name: str

# class WatchlistData(BaseModel):
#     watchlist: list[Coin]

def read_watchlist():
    if not os.path.exists(WATCHLIST_FILE):
        return {"watchlist": []}
    with open(WATCHLIST_FILE, "r") as f:
        return json.load(f)

def write_watchlist(data):
    with open(WATCHLIST_FILE, "w") as f:
        json.dump(data, f, indent=2)

@app.get("/watchlist")
def get_watchlist():
    return read_watchlist()

# @app.post("/watchlist")
# def update_watchlist(data: WatchlistData):
#     write_watchlist(data.model_dump())
#     return {"success": True}

    

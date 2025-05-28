
import pandas as pd
import requests
import ta
import asyncio
import time
import threading
import random
from datetime import datetime
from alpaca.data.historical import CryptoHistoricalDataClient
from alpaca.data.live import CryptoDataStream
from alpaca.data.requests import CryptoBarsRequest
from alpaca.data.timeframe import TimeFrame, TimeFrameUnit
from alpaca.data.live.crypto import CryptoFeed
import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'oms')))
from order_manager import OrderManager
from order import Side, OrderType
from alpaca_client import AlpacaClient
from dotenv import load_dotenv

# -----------------------------------------
# Configuration
# -----------------------------------------
symbols = ["BTC/USD", "ETH/USD", "SOL/USD"]
intervals = {
    "1Min": TimeFrame(1, TimeFrameUnit.Minute),
    "5Min": TimeFrame(5, TimeFrameUnit.Minute),
    "15Min": TimeFrame(15, TimeFrameUnit.Minute)
}
load_dotenv()

ALPACA_API_KEY = os.getenv("ALPACA_API_KEY")
ALPACA_SECRET_KEY = os.getenv("ALPACA_SECRET_KEY")
ALPACA_BASE_URL = os.getenv("ALPACA_BASE_URL")

alpaca_client = AlpacaClient(ALPACA_API_KEY, ALPACA_SECRET_KEY, ALPACA_BASE_URL)
client = CryptoHistoricalDataClient(ALPACA_API_KEY, ALPACA_SECRET_KEY)
stream = CryptoDataStream(ALPACA_API_KEY, ALPACA_SECRET_KEY, feed=CryptoFeed.US)
order_manager = OrderManager(alpaca_client)
bar_data = {s: pd.DataFrame() for s in symbols}
MAX_BARS = 100
current_strategy = None

# -----------------------------------------
# Sentiment Integration
# -----------------------------------------
def fetch_score():
    try:
        url = "https://api.alternative.me/fng/"
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            value = int(data['data'][0]['value'])  
            return round(value / 100, 2)
    except Exception as e:
        print("fetch failed:", e)
    return 0.5


def fetch_active_strategy():
    try:
        url = "https://api.alternative.me/fng/"
        response = requests.get(url)
        if response.status_code == 200:
            data = response.json()
            value = int(data['data'][0]['value'])  
            return round(value / 100, 2)
    except Exception as e:
        print("fetch failed:", e)
    return 0.5


def get_active_strategy(sentiment_score):
    if sentiment_score > 0.7:
        return "EMA"
    elif sentiment_score < 0.3:
        return "RSI"
    else:
        return "SMA"

def run_selected_strategy(name):
    if name == "EMA":
        run_ema_engine()
    elif name == "RSI":
        run_rsi_engine()
    elif name == "SMA":
        run_engine_sma_crossover()

# -----------------------------------------
# Order 
# -----------------------------------------
def send_order(symbol, action):
    qty = 0.1  
    side = Side.BUY if action == "BUY" else Side.SELL
    type_ = OrderType.MARKET
    order, msg = order_manager.submit_order(symbol, qty, side, type_)
    print(f">>> send_order [{datetime.now().strftime('%H:%M:%S')}] {msg}")

# -----------------------------------------
# Real-Time WebSocket Handler
# -----------------------------------------
async def on_bar(bar):
    print("📡 on_bar called...")
    symbol = bar.symbol
    print(f"🔔 Received bar for {symbol} at {bar.timestamp}")
    print(f"    Open: {bar.open}, High: {bar.high}, Low: {bar.low}, Close: {bar.close}, Vol: {bar.volume}")

    df = bar_data.get(symbol)
    if df is None:
        bar_data[symbol] = pd.DataFrame()
        df = bar_data[symbol]

    bar_dict = {
        "timestamp": bar.timestamp,
        "open": bar.open,
        "high": bar.high,
        "low": bar.low,
        "close": bar.close,
        "volume": bar.volume
    }

    df = pd.concat([df, pd.DataFrame([bar_dict])], ignore_index=True)
    df = df.sort_values("timestamp").drop_duplicates(subset=["timestamp"]).tail(MAX_BARS)
    bar_data[symbol] = df

    if len(df) >= 10:
        print(f"[{symbol}] Running scalping strategy...")
        run_scalping_strategy(symbol, df)

# -----------------------------------------
# SCALPING Strategy (WebSocket only)
# -----------------------------------------
def run_scalping_strategy(symbol, df):
    df['return'] = df['close'].pct_change()
    last_return = df['return'].iloc[-1]
    last_volume = df['volume'].iloc[-1]
    avg_volume = df['volume'].iloc[-5:].mean()

    signal = "HOLD"
    if last_return > 0.0015 and last_volume > avg_volume * 1.2:
        signal = "BUY"
    elif last_return < -0.0015 and last_volume > avg_volume * 1.2:
        signal = "SELL"

    if signal != "HOLD":
        print(f"[SCALPING] {symbol}: {signal}")
        send_order(symbol, signal)

# -----------------------------------------
# SMA Strategy (Polled)
# -----------------------------------------
def run_engine_sma_crossover():
    print("\n[SMA] Running SMA strategy...")
    sma_short = 9
    sma_long = 21

    for symbol in symbols:
        try:
            bars_response = client.get_crypto_bars(
                CryptoBarsRequest(symbol_or_symbols=symbol, timeframe=TimeFrame.Minute, limit=100)
            )
            bars = bars_response.data.get(symbol)
            if not bars or len(bars) < sma_long:
                continue

            df = pd.DataFrame([dict(bar) for bar in bars]).sort_values("timestamp")
            df['sma_short'] = df['close'].rolling(window=sma_short).mean()
            df['sma_long'] = df['close'].rolling(window=sma_long).mean()
            df['signal'] = (df['sma_short'] > df['sma_long']).astype(int)
            df['crossover'] = df['signal'].diff()

            signal = "HOLD"
            if df['crossover'].iloc[-1] == 1:
                signal = "BUY"
            elif df['crossover'].iloc[-1] == -1:
                signal = "SELL"

            print(f"[SMA] {symbol}: {signal}")
            if signal != "HOLD":
                send_order(symbol, signal)

        except Exception as e:
            print(f"[SMA] Error for {symbol}: {e}")

# -----------------------------------------
# EMA Strategy (Polled)
# -----------------------------------------
def run_ema_engine():
    ema_short = 9
    ema_long = 21
    print("\n[EMA] Running EMA strategy...")
    for symbol in symbols:
        for label, tf in intervals.items():
            try:
                bars_response = client.get_crypto_bars(
                    CryptoBarsRequest(symbol_or_symbols=symbol, timeframe=tf, limit=100)
                )
                bars = bars_response.data.get(symbol)
                if not bars or len(bars) < ema_long:
                    print(f"Not enough data for {symbol} @ {label}")
                    continue

                df = pd.DataFrame([dict(bar) for bar in bars])
                df.sort_values("timestamp", inplace=True)
                df['ema_short'] = df['close'].ewm(span=ema_short, adjust=False).mean()
                df['ema_long'] = df['close'].ewm(span=ema_long, adjust=False).mean()
                df['signal'] = (df['ema_short'] > df['ema_long']).astype(int)
                df['crossover'] = df['signal'].diff()

                last_row = df.iloc[-1]
                signal = "HOLD"
                if last_row['crossover'] == 1:
                    signal = "BUY"
                elif last_row['crossover'] == -1:
                    signal = "SELL"

                print(f"[EMA] {symbol} @ {label}: {signal}")
                if signal in ["BUY", "SELL"]:
                    send_order(symbol, signal)

            except Exception as e:
                print(f"[EMA] Error for {symbol} @ {label}: {e}")

# -----------------------------------------
# RSI Strategy (Polled)
# -----------------------------------------
def run_rsi_engine():
    print("\n[RSI] Running RSI strategy...")
    from ta.momentum import RSIIndicator

    for symbol in symbols:
        for label, tf in intervals.items():
            try:
                bars_response = client.get_crypto_bars(
                    CryptoBarsRequest(symbol_or_symbols=symbol, timeframe=tf, limit=100)
                )
                bars = bars_response.data.get(symbol)
                if not bars or len(bars) < 15:
                    continue

                df = pd.DataFrame([dict(bar) for bar in bars]).sort_values("timestamp")
                df['rsi'] = RSIIndicator(close=df['close'], window=14).rsi()
                rsi_now = df['rsi'].dropna().iloc[-1]
                rsi_prev = df['rsi'].dropna().iloc[-2]

                signal = "HOLD"
                if rsi_prev < 30 and rsi_now > 30:
                    signal = "BUY"
                elif rsi_prev > 70 and rsi_now < 70:
                    signal = "SELL"

                print(f"[RSI] {symbol} @ {label}: {signal}")
                if signal != "HOLD":
                    send_order(symbol, signal)

            except Exception as e:
                print(f"[RSI] Error for {symbol} @ {label}: {e}")

# -----------------------------------------
# Main Polling Loop (Sentiment-Driven)
# -----------------------------------------
def polling_loop():
    global current_strategy
    while True:
        try:
            sentiment_score = fetch_score()
            print(f"\nSentiment Score: {sentiment_score:.2f}")
            new_strategy = get_active_strategy(sentiment_score)

            if new_strategy != current_strategy:
                print(f"Switching strategy from {current_strategy or 'None'} to {new_strategy}")
                current_strategy = new_strategy
            else:
                print(f" Continuing with {current_strategy} strategy")

            run_selected_strategy(current_strategy)

        except Exception as e:
            print(f"[POLLING ERROR] {e}")
        time.sleep(60)

# -----------------------------------------
# WebSocket Handler (Optional)
# -----------------------------------------
def websocket_loop():
    try:
        print(f"Subscribing to symbols: {symbols}")
        stream.subscribe_bars(on_bar, 'BTC/USD')
        print("✅ WebSocket stream is live.")
        stream.run()
    except KeyboardInterrupt:
        print("Interrupted by user. Closing stream.")
        asyncio.run(stream.stop_ws())
    except Exception as e:
        print(f"[WebSocket Error] {e}")

if __name__ == '__main__':
    threading.Thread(target=polling_loop, daemon=False).start()
    # websocket_loop()

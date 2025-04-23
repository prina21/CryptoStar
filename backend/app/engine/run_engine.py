import pandas as pd
import ta
import asyncio
import time
import threading
from datetime import datetime
from alpaca.data.historical import CryptoHistoricalDataClient
from alpaca.data.live import CryptoDataStream
from alpaca.data.requests import CryptoBarsRequest
from alpaca.data.timeframe import TimeFrame, TimeFrameUnit
from alpaca.data.live.crypto import CryptoFeed
from config.settings import ALPACA_API_KEY, ALPACA_SECRET_KEY

# -----------------------------------------
# Configuration
# -----------------------------------------
symbols = ["BTC/USD", "ETH/USD", "SOL/USD"]  # ✅ Correct format for SDK
intervals = {
    "1Min": TimeFrame(1, TimeFrameUnit.Minute),
    "5Min": TimeFrame(5, TimeFrameUnit.Minute),
    "15Min": TimeFrame(15, TimeFrameUnit.Minute)
}

client = CryptoHistoricalDataClient(ALPACA_API_KEY, ALPACA_SECRET_KEY)
stream = CryptoDataStream(ALPACA_API_KEY, ALPACA_SECRET_KEY, feed=CryptoFeed.US)
bar_data = {s: pd.DataFrame() for s in symbols}
MAX_BARS = 100

# -----------------------------------------
# Order Stub
# -----------------------------------------
def send_order(symbol, action):
    print(f">>> [{datetime.now().strftime('%H:%M:%S')}] {action} order sent for {symbol}")

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
    signal_table = {}

    print("\n--- EMA Strategy Signals ---")
    for symbol in symbols:
        signal_table[symbol] = {}
        for label, tf in intervals.items():
            try:
                bars_response = client.get_crypto_bars(
                    CryptoBarsRequest(
                        symbol_or_symbols=symbol,
                        timeframe=tf,
                        limit=100
                    )
                )
                bars = bars_response.data.get(symbol)
                if not bars or len(bars) < ema_long:
                    print(f"Not enough data for {symbol} @ {label}")
                    continue

                df = pd.DataFrame([dict(bar) for bar in bars])
                df.sort_values("timestamp", inplace=True)

                # Calculate EMAs
                df['ema_short'] = df['close'].ewm(span=ema_short, adjust=False).mean()
                df['ema_long'] = df['close'].ewm(span=ema_long, adjust=False).mean()

                # Signal logic
                df['signal'] = 0
                df['signal'] = (df['ema_short'] > df['ema_long']).astype(int)
                df['crossover'] = df['signal'].diff()

                last_row = df.iloc[-1]
                signal = "HOLD"

                if last_row['crossover'] == 1:
                    signal = "BUY"
                elif last_row['crossover'] == -1:
                    signal = "SELL"

                signal_table[symbol][label] = signal
                print(f"{symbol} @ {label}: {signal}")

                if signal in ["BUY", "SELL"]:
                    send_order(symbol, signal)

            except Exception as e:
                print(f"Error processing {symbol} @ {label}: {e}")
  

# -----------------------------------------
# RSI Strategy (Polled)
# -----------------------------------------
def run_rsi_engine():
    print("\n[RSI] Running RSI strategy...")
    from ta.momentum import RSIIndicator

    rsi_table = {}

    for symbol in symbols:
        try:
            rsi_table[symbol] = {}

            for label, tf in intervals.items():
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
                rsi_table[symbol][label] = (rsi_now, rsi_prev)

        except Exception as e:
            print(f"[RSI] Error for {symbol}: {e}")

    for symbol, rsis in rsi_table.items():
        rsi_15 = rsis.get("15Min", (None, None))[0]
        rsi_5 = rsis.get("5Min", (None, None))[0]
        rsi_1, rsi_1_prev = rsis.get("1Min", (None, None))

        signal = "HOLD"
        if None not in [rsi_15, rsi_5, rsi_1, rsi_1_prev]:
            if rsi_15 > 50 and rsi_5 > 50 and rsi_1_prev < 30 and rsi_1 > 30:
                signal = "BUY"
            elif rsi_15 < 50 and rsi_5 < 50 and rsi_1_prev > 70 and rsi_1 < 70:
                signal = "SELL"
        print(f"[RSI] {symbol}: {signal}")
        if signal != "HOLD":
            send_order(symbol, signal)

# -----------------------------------------
# MAIN LOOPS
# -----------------------------------------
def polling_loop():
    while True:
        try:
            run_engine_sma_crossover()
            run_ema_engine()
            run_rsi_engine()
        except Exception as e:
            print(f"[POLLING ERROR] {e}")
        time.sleep(60)

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

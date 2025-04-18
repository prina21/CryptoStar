from config.settings import ALPACA_API_KEY, ALPACA_SECRET_KEY
from alpaca.data.historical import CryptoHistoricalDataClient
from alpaca.data.requests import CryptoLatestQuoteRequest, CryptoBarsRequest
from alpaca.data.timeframe import TimeFrame, TimeFrameUnit
import pandas as pd
import ta
import pprint

client = CryptoHistoricalDataClient(ALPACA_API_KEY, ALPACA_SECRET_KEY)

symbols = ["BTC/USD", "ETH/USD", "SOL/USD"]
intervals = {
    "1Min": TimeFrame.Minute,
    "5Min": TimeFrame(5, TimeFrameUnit.Minute),
    "15Min": TimeFrame(15, TimeFrameUnit.Minute)
}

# ---------------------------------------------------------
# Scalping Strategy: Momentum + Volume Spike Confirmation
#
# This strategy is designed for short-term trades using
# 1-minute candle data. It detects rapid price movements
# (momentum) and confirms signals with sudden increases
# in trading volume.
#
# Logic:
# - If the most recent return > 0.15% and volume > 1.2x average → BUY
# - If the most recent return < -0.15% and volume > 1.2x average → SELL
# - Otherwise → HOLD
#
# This simulates an HFT-style reaction strategy using free
# API data, appropriate for rapid intraday decision-making.
# ---------------------------------------------------------
def run_scalping_strategy():
    print("\n--- Scalping Strategy Execution ---")
    for symbol in symbols:
        try:
            bars_response = client.get_crypto_bars(
                CryptoBarsRequest(
                    symbol_or_symbols=symbol,
                    timeframe=TimeFrame.Minute,
                    limit=10
                )
            )

            bars = bars_response.data.get(symbol)
            if not bars or len(bars) < 5:
                print(f"Not enough data for {symbol}")
                continue

            df = pd.DataFrame([dict(bar) for bar in bars])
            df.sort_values("timestamp", inplace=True)

            # Calculate momentum (short-term return)
            df['return'] = df['close'].pct_change()
            avg_return = df['return'].iloc[-5:].mean()
            last_return = df['return'].iloc[-1]

            # Volume confirmation
            last_volume = df['volume'].iloc[-1]
            avg_volume = df['volume'].iloc[-5:].mean()

            # Scalping logic
            signal = "HOLD"
            if last_return > 0.0015 and last_volume > avg_volume * 1.2:
                signal = "BUY"
            elif last_return < -0.0015 and last_volume > avg_volume * 1.2:
                signal = "SELL"

            print(f"{symbol}: {signal} | 1-min Return: {last_return:.4f} | Volume Spike: {last_volume > avg_volume * 1.2}")

            if signal in ["BUY", "SELL"]:
                send_order(symbol, signal)

        except Exception as e:
            print(f"Error in scalping strategy for {symbol}: {e}")

# ---------------------------------------------------------
# SMA Crossover Strategy: Trend-Following System
#
# This strategy compares two Simple Moving Averages:
# - Short SMA (9-period)
# - Long SMA (21-period)
#
# A BUY signal is generated when the short SMA crosses
# above the long SMA (golden cross), indicating upward momentum.
#
# A SELL signal is triggered when the short SMA crosses
# below the long SMA (death cross), indicating a downtrend.
# ---------------------------------------------------------
def run_engine_sma_crossover():
    sma_short = 9
    sma_long = 21
    signal_table = {}

    print("\n--- SMA Crossover Strategy Signals ---")
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
                if not bars or len(bars) < sma_long:
                    print(f"Not enough data for {symbol} @ {label}")
                    continue

                df = pd.DataFrame([dict(bar) for bar in bars])
                df.sort_values("timestamp", inplace=True)

                # Calculate SMAs
                df['sma_short'] = df['close'].rolling(window=sma_short).mean()
                df['sma_long'] = df['close'].rolling(window=sma_long).mean()

                # Crossover signal
                df['signal'] = 0
                df['signal'] = (df['sma_short'] > df['sma_long']).astype(int)
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

# ---------------------------------------------------------
# EMA Crossover Strategy: Reactive Trend-Following
#
# Similar to the SMA strategy but uses Exponential Moving Averages,
# which respond faster to recent price changes.
#
# Logic:
# - Short EMA (9) > Long EMA (21) → BUY Signal (golden cross)
# - Short EMA (9) < Long EMA (21) → SELL Signal (death cross)
#
# Good for faster momentum signals with recent price sensitivity.
# ---------------------------------------------------------
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

# ---------------------------------------------------------
# RSI Strategy: Mean-Reversion & Momentum Confirmation
#
# This strategy uses the Relative Strength Index (RSI) across
# multiple timeframes (1Min, 5Min, 15Min) to identify entry points.
#
# BUY Signal:
# - RSI(15Min) > 50
# - RSI(5Min) > 50
# - RSI(1Min) crossed up from <30 (oversold)
#
# SELL Signal:
# - RSI(15Min) < 50
# - RSI(5Min) < 50
# - RSI(1Min) crossed down from >70 (overbought)
#
# Helps avoid trades in weak trends and adds context to entries.
# ---------------------------------------------------------
def run_rsi_engine():
    quotes = client.get_crypto_latest_quote(CryptoLatestQuoteRequest(symbol_or_symbols=symbols))

    rsi_table = {}

    for symbol in symbols:
        print(f"\nRSI for {symbol}")
        rsi_table[symbol] = {}
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
                if not bars or len(bars) < 15:
                    print(f"Insufficient data for {symbol} @ {label}")
                    continue

                df = pd.DataFrame([dict(bar) for bar in bars])
                df.sort_values("timestamp", inplace=True)

                # Calculate RSI
                df['rsi'] = ta.momentum.RSIIndicator(close=df['close'], window=14).rsi()
                rsi_now = df['rsi'].dropna().iloc[-1]
                rsi_prev = df['rsi'].dropna().iloc[-2]

                rsi_table[symbol][label] = (round(rsi_now, 2), round(rsi_prev, 2))

                print(f"{label} RSI: {rsi_now:.2f}")

            except Exception as e:
                print(f"Error getting RSI for {symbol} @ {label}: {e}")

    # --- Generate Buy/Sell Signals ---
    print("\n--- Trade Signals ---")
    for symbol, rsis in rsi_table.items():
        try:
            rsi_15, _ = rsis.get("15Min", (None, None))
            rsi_5, _ = rsis.get("5Min", (None, None))
            rsi_1, rsi_1_prev = rsis.get("1Min", (None, None))

            signal = "HOLD"

            if None not in [rsi_15, rsi_5, rsi_1, rsi_1_prev]:
                # Buy Signal
                if rsi_15 > 50 and rsi_5 > 50 and rsi_1_prev < 30 and rsi_1 > 30:
                    signal = "BUY"
                # Sell Signal
                elif rsi_15 < 50 and rsi_5 < 50 and rsi_1_prev > 70 and rsi_1 < 70:
                    signal = "SELL"

            print(f"{symbol}: {signal}")

            # --- Order Instruction Placeholder ---
            if signal in ["BUY", "SELL"]:
                send_order(symbol, signal)

        except Exception as e:
            print(f"Error generating signal for {symbol}: {e}")
        
        


def send_order(symbol, action):
    # Stub function to simulate sending to OMS
    print(f">>> Sending {action} order for {symbol} to OMS...")


if __name__ == '__main__':
    run_scalping_strategy()



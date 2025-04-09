import ccxt
import pandas as pd
import numpy as np
import time
import matplotlib.pyplot as plt

exchange = ccxt.kucoin()

# Define trading parameters
symbol = 'BTC/USDT'
timeframe = '1h'
short_window = 9
long_window = 21

def fetch_historical_data(symbol, timeframe, limit=10):
    try:
        ohlcv = exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
        df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        return df
    except ccxt.BaseError as e:
        print(f"Error fetching data: {str(e)}")
        return None

def calculate_ema_strategy(df, short_window, long_window):
    df['EMA_Short'] = df['close'].ewm(span=short_window, adjust=False).mean()
    df['EMA_Long'] = df['close'].ewm(span=long_window, adjust=False).mean()

    df['Signal'] = np.where(df['EMA_Short'] > df['EMA_Long'], 1, 0)
    df['Crossover'] = df['Signal'].diff()

    return df

def plot_strategy(df):
    plt.figure(figsize=(12, 6))
    plt.plot(df['timestamp'], df['close'], label='Close Price', color='black')
    plt.plot(df['timestamp'], df['EMA_Short'], label=f'{short_window}-period EMA', color='blue')
    plt.plot(df['timestamp'], df['EMA_Long'], label=f'{long_window}-period EMA', color='red')

    buy_signals = df[df['Crossover'] == 1]
    sell_signals = df[df['Crossover'] == -1]

    plt.scatter(buy_signals['timestamp'], buy_signals['close'], marker='^', color='green', label='Buy Signal', alpha=1)
    plt.scatter(sell_signals['timestamp'], sell_signals['close'], marker='v', color='red', label='Sell Signal', alpha=1)

    plt.title(f'Trend-Based Trading Strategy: {symbol}')
    plt.xlabel('Time')
    plt.ylabel('Price (USDT)')
    plt.legend()
    plt.grid()
    plt.show()

market_data = fetch_historical_data(symbol, timeframe)

if market_data is not None:
    strategy_data = calculate_ema_strategy(market_data, short_window, long_window)

    last_signal = strategy_data.iloc[-1]
    if last_signal['Crossover'] == 1:
        print(f"🔼 Buy Signal Detected at {last_signal['timestamp']}: {last_signal['close']} USDT")
    elif last_signal['Crossover'] == -1:
        print(f"🔻 Sell Signal Detected at {last_signal['timestamp']}: {last_signal['close']} USDT")
    else:
        print("⚡ No new trade signals at the moment.")

    plot_strategy(strategy_data)

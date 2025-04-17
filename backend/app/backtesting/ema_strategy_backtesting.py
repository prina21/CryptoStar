import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..', 'strategies')))

import ccxt
import pandas as pd
import matplotlib.pyplot as plt

from ema_strategy import calculate_ema_strategy
exchange = ccxt.kucoin()

# Trading Parameters
symbol = 'BTC/USDT'
timeframe = '1h'
short_window = 9
long_window = 21

def fetch_historical_data(symbol, timeframe, limit=1000):
    try:
        ohlcv = exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
        df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
        df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
        print("")
        print(df)
        return df
    except ccxt.BaseError as e:
        print(f"Error fetching data: {str(e)}")
        return None
    
def backtest(df, initial_balance=1000):
    in_position = False
    balance = initial_balance
    btc = 0
    trade_log = []

    for i in range(1, len(df)):
        if df.iloc[i]['Crossover'] == 1 and not in_position:
            btc = balance / df.iloc[i]['close']
            balance = 0
            trade_log.append(('Buy', df.iloc[i]['timestamp'], df.iloc[i]['close']))
            in_position = True

        elif df.iloc[i]['Crossover'] == -1 and in_position:
            balance = btc * df.iloc[i]['close']
            btc = 0
            trade_log.append(('Sell', df.iloc[i]['timestamp'], df.iloc[i]['close']))
            in_position = False

    final_value = balance if not in_position else btc * df.iloc[-1]['close']
    print(f"\n Final Portfolio Value: ${final_value:.2f}")
    print("Trade Log:")
    for t in trade_log:
        print(f"{t[0]} at {t[1]}: {t[2]}")
    return final_value, trade_log

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

if __name__ == '__main__':
    data = fetch_historical_data(symbol, timeframe)
    strategy_data = calculate_ema_strategy(data, short_window, long_window)
    final_value, trades = backtest(strategy_data)
    plot_strategy(strategy_data)


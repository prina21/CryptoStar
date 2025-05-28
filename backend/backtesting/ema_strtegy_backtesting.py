import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

import ccxt
import pandas as pd
import matplotlib.pyplot as plt
import numpy as np
from datetime import datetime
from strategies.ema_strategy import calculate_ema_strategy
from strategies.rsi import calculate_rsi_strategy
from historicalData import aggregate_trades_to_ohlcv, load_binance_trade_files
from databases.dbMetrics import insert_risk_metrics
from databases.postgresConnect import get_connection
# exchange = ccxt.kucoin()

# Trading Parameters
# symbol = 'BTC/USDT'
symbol = 'BNBUSDT'
timeframe = '1h'
short_window = 9
long_window = 21

# def fetch_historical_data(symbol, timeframe, limit=1000):
#     try:
#         ohlcv = exchange.fetch_ohlcv(symbol, timeframe, limit=limit)
#         df = pd.DataFrame(ohlcv, columns=['timestamp', 'open', 'high', 'low', 'close', 'volume'])
#         df['timestamp'] = pd.to_datetime(df['timestamp'], unit='ms')
#         print("")
#         print(df)
#         return df
#     except ccxt.BaseError as e:
#         print(f"Error fetching data: {str(e)}")
#         return None
    
def backtest(df, initial_balance=1000):
    in_position = False
    balance = initial_balance
    btc = 0
    trade_log = []
    portfolio_values = []

    for i in range(1, len(df)):
        price = df.iloc[i]['close']
        timestamp = df.iloc[i]['timestamp']
        current_value = balance if not in_position else btc * price
        
        portfolio_values.append({
            'timestamp': timestamp,
            'portfolio_value': current_value,
            'price': price,
            'in_position': in_position
        })

        if df.iloc[i]['Crossover'] == 1 and not in_position:
            btc = balance / price
            balance = 0
            trade_log.append(('Buy', timestamp, price))
            in_position = True

        elif df.iloc[i]['Crossover'] == -1 and in_position:
            balance = btc * price
            btc = 0
            trade_log.append(('Sell', timestamp, price))
            in_position = False

    final_value = balance if not in_position else btc * df.iloc[-1]['close']
    portfolio_values.append({
        'timestamp': df.iloc[-1]['timestamp'],
        'portfolio_value': final_value,
        'price': df.iloc[-1]['close'],
        'in_position': in_position
    })

    print(f"\n Final Portfolio Value: ${final_value:.2f}")
    print("Trade Log:")
    # portfolio_values.append(final_value)

    for t in trade_log:
        print(f"{t[0]} at {t[1]}: {t[2]}")

    risk = calculate_risk_metrics(portfolio_values, timeframe)
    # print(risk)

    metrics_dict = {
        "initial_balance": initial_balance,
        "final_balance": final_value,
        **risk  # Unpack sharpe, sortino, etc.
    }

    conn = get_connection() 
    insert_risk_metrics(
        symbol,
        strategy_name='RSI Crossover',
        short_window=short_window,
        long_window=long_window,
        metrics_dict=metrics_dict,
        conn=conn
    )
    conn.close()

    # for action, ts, price in trade_log[:5]:
    #     print(f"{action} at {ts} for price {price}")

    # metrics = calculate_risk_metrics(portfolio_values)

    return {
        "final_value": final_value,
        "trade_log": trade_log,
        "portfolio_values": pd.DataFrame(portfolio_values)
        # "risk_metrics": metrics
    }

def calculate_risk_metrics(portfolio_values, timeframe):
    pv = np.array([entry['portfolio_value'] for entry in portfolio_values])
    returns = np.diff(pv) / pv[:-1]

    periods_per_year = {
        '1Min': 365 * 24 * 60,
        '5Min': 365 * 24 * 60 / 5,
        '15Min': 365 * 24 * 60 / 15,
        '1H': 365 * 24,
        '1D': 365,
    }.get(timeframe, 365 * 24 * 60)

    avg_return = np.mean(returns)
    std_dev = np.std(returns)
    downside_std = np.std(returns[returns < 0])

    sharpe = (avg_return / std_dev) * np.sqrt(periods_per_year) if std_dev > 0 else 0
    sortino = (avg_return / downside_std) * np.sqrt(periods_per_year) if downside_std > 0 else 0
    volatility = std_dev * np.sqrt(periods_per_year)

    cumulative = np.maximum.accumulate(pv)
    drawdowns = (pv - cumulative) / cumulative
    max_drawdown = np.min(drawdowns)

    start_time = pd.to_datetime(portfolio_values[0]['timestamp'])
    end_time = pd.to_datetime(portfolio_values[-1]['timestamp'])
    days = (end_time - start_time).days + 1  # add 1 to avoid zero
    
    years = days / 365
    cagr = (pv[-1] / pv[0])**(1 / years) - 1 if years > 0 else 0

    return {
        'sharpe': sharpe,
        'sortino': sortino,
        'max_drawdown': max_drawdown,
        'volatility': volatility,
        'cagr': cagr
    }



# def plot_strategy(df):
#     plt.figure(figsize=(12, 6))
#     plt.plot(df['timestamp'], df['close'], label='Close Price', color='black')
#     plt.plot(df['timestamp'], df['EMA_Short'], label=f'{short_window}-period EMA', color='blue')
#     plt.plot(df['timestamp'], df['EMA_Long'], label=f'{long_window}-period EMA', color='red')

#     buy_signals = df[df['Crossover'] == 1]
#     sell_signals = df[df['Crossover'] == -1]

#     plt.scatter(buy_signals['timestamp'], buy_signals['close'], marker='^', color='green', label='Buy Signal', alpha=1)
#     plt.scatter(sell_signals['timestamp'], sell_signals['close'], marker='v', color='red', label='Sell Signal', alpha=1)

#     plt.title(f'Trend-Based Trading Strategy: {symbol}')
#     plt.xlabel('Time')
#     plt.ylabel('Price (USDT)')
#     plt.legend()
#     plt.grid()
#     plt.show()

# def calculate_risk_metrics(portfolio_values):
#     import numpy as np

#     # Calculate returns
#     returns = np.diff(portfolio_values) / portfolio_values[:-1]

#     # Max drawdown
#     cumulative = np.maximum.accumulate(portfolio_values)
#     drawdown = (portfolio_values - cumulative) / cumulative
#     max_drawdown = drawdown.min()

#     # Sharpe Ratio
#     mean_return = returns.mean()
#     std_return = returns.std()
#     sharpe_ratio = (mean_return / std_return) * np.sqrt(6048) if std_return != 0 else 0

#     return {
#         "max_drawdown": float(max_drawdown),
#         "sharpe_ratio": float(sharpe_ratio)
#     }

if __name__ == '__main__':
    raw_df = load_binance_trade_files('../datasets', symbol)
    data = aggregate_trades_to_ohlcv(raw_df, timeframe)
    # strategy_data = calculate_ema_strategy(data, short_window, long_window)
    strategy_data = calculate_rsi_strategy(data, short_window, long_window)
    results = backtest(strategy_data)
    portfolio_df = results['portfolio_values']

    portfolio_df.plot(x='timestamp', y='portfolio_value', figsize=(12, 6), title='Portfolio Value Over Time')
    # plt.grid()
    # plt.show()

    # final_value = results['final_value']
    # trades = results['trade_log']
    # plot_strategy(strategy_data)
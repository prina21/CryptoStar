import sys
import os
sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))


from databases.dbMetrics import insert_risk_metrics
from strategies import ema_strategy
from historicalData import load_binance_trade_files
from databases.postgresConnect import get_connection

symbols = ['ETH/USDT']

def run_backtesting(symbol, strategy_fn, short_window, long_window, conn):
    df = load_binance_trade_files(symbol)
    trades, metrics = strategy_fn(df, short_window, long_window)
    insert_risk_metrics(symbol, strategy_fn.__name__, short_window, long_window, metrics, conn)

if __name__ == "__main__":
    symbols = ['BTC/USDT', 'ETH/USDT', 'BNB/USDT']
    short_window = 9
    long_window = 21

    conn = get_connection()  # open DB connection

    for symbol in symbols:
        run_backtesting(symbol, ema_strategy, short_window, long_window, conn)

    conn.close()
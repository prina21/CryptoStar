import pandas as pd
import numpy as np

def calculate_rsi_strategy(df, period=14, rsi_buy_threshold=30, rsi_sell_threshold=70):
    delta = df['close'].diff()
    gain = np.where(delta > 0, delta, 0)
    loss = np.where(delta < 0, -delta, 0)

    # Use min_periods=1 to avoid warnings for early rows
    avg_gain = pd.Series(gain).rolling(window=period, min_periods=1).mean()
    avg_loss = pd.Series(loss).rolling(window=period, min_periods=1).mean()

    rs = avg_gain / (avg_loss + 1e-10)  # Prevent division by zero
    rsi = 100 - (100 / (1 + rs))
    df['RSI'] = rsi

    # Generate trading signals
    df['Signal'] = 0
    df.loc[df['RSI'] < rsi_buy_threshold, 'Signal'] = 1  # Buy
    df.loc[df['RSI'] > rsi_sell_threshold, 'Signal'] = -1  # Sell
    df['Crossover'] = df['Signal'].diff()

    return df

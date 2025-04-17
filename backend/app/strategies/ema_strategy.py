import numpy as np

def calculate_ema_strategy(df, short_window, long_window):
    df['EMA_Short'] = df['close'].ewm(span=short_window, adjust=False).mean()
    df['EMA_Long'] = df['close'].ewm(span=long_window, adjust=False).mean()

    df['Signal'] = np.where(df['EMA_Short'] > df['EMA_Long'], 1, 0)
    df['Crossover'] = df['Signal'].diff()

    return df

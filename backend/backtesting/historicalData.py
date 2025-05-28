import pandas as pd
import glob
import os

def load_binance_trade_files(folder_path, symbol=None):
    files = glob.glob(os.path.join(folder_path, '*.csv.gz'))
    data_frames = []

    for file in files:
        if symbol and symbol.upper() not in file.upper():
            continue
        
        print(f"Loading {file} ...")
        df = pd.read_csv(file, compression='gzip')
        
        # Convert microseconds to datetime
        df['timestamp'] = pd.to_datetime(df['timestamp'] // 1000, unit='ms')

        # Filter symbol if needed
        if symbol:
            df = df[df['symbol'] == symbol.upper()]

        df = df.sort_values('timestamp')
        data_frames.append(df)

    if not data_frames:
        raise ValueError("No data files loaded for given symbol or path.")
    
    full_data = pd.concat(data_frames, ignore_index=True)
    return full_data

def aggregate_trades_to_ohlcv(df, timeframe='1Min'):
    df.set_index('timestamp', inplace=True)
    
    ohlcv = df['price'].resample(timeframe).ohlc()
    volume = df['amount'].resample(timeframe).sum()
    
    ohlcv['volume'] = volume
    ohlcv.dropna(inplace=True)
    
    return ohlcv.reset_index()

if __name__ == '__main__':
    data_folder = '../datasets'  
    symbol = 'BTCUSDT'
    
    df = load_binance_trade_files(data_folder, symbol)
    print(f"Loaded {len(df)} trades for {symbol}")

    ohlcv_df = aggregate_trades_to_ohlcv(df, '1Min')
    # print(ohlcv_df.head())

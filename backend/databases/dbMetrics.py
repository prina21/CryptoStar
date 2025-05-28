def insert_risk_metrics(symbol, strategy_name, short_window, long_window, metrics_dict, conn):
    try: 
        with conn.cursor() as cur:
            cur.execute("""INSERT INTO risk_backtest (symbol, strategy, short_window, long_window, initial_balance, final_balance, sharpe, sortino, max_drawdown, volatility, cagr)
            VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
        """, (symbol,
            strategy_name,
            int(short_window),
            int(long_window),
            float(metrics_dict["initial_balance"]),
            float(metrics_dict["final_balance"]),
            float(metrics_dict["sharpe"]),
            float(metrics_dict["sortino"]),
            float(metrics_dict["max_drawdown"]),
            float(metrics_dict["volatility"]),
            float(metrics_dict["cagr"]),))
        conn.commit()
    except Exception as e:
        conn.rollback()
        print(f"Error inserting risk metrics: {e}")   

def fetch_latest_metrics(conn):
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM risk_backtest ORDER BY timestamp DESC LIMIT 1;")
    row = cursor.fetchone()
    
    if row is None:
        return {"message": "No data found"}

    # Adjust field names based on your actual DB schema
    return {
        "created_at": row[0],
        "max_drawdown": row[1],
        "sharpe_ratio": row[2],
        "symbol": row[3],
        "strategy": row[4],
        # "value_at_risk": row[5],
        # "cagr": row[6],
    }
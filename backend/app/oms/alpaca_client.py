
from alpaca_trade_api.rest import REST

class AlpacaClient:
    def __init__(self, api_key, secret_key, base_url):
        self.api = REST(api_key, secret_key, base_url)

    def submit_market_order(self, symbol, qty, side):
        return self.api.submit_order(
            symbol=symbol,
            qty=qty,
            side=side,
            type="market",
            time_in_force="gtc"
        )

    def submit_limit_order(self, symbol, qty, side, limit_price):
        return self.api.submit_order(
            symbol=symbol,
            qty=qty,
            side=side,
            type="limit",
            limit_price=limit_price,
            time_in_force="gtc"
        )
    
    def cancel_order(self, order_id):
        try:
            self.api.cancel_order(order_id)  
            print(f"Alpaca order {order_id} cancelled.")
            
        except Exception as e:
            print(f"Error cancelling Alpaca order: {e}")
            raise

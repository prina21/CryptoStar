from alpaca_client import AlpacaClient
from order import Side, OrderType
from order_manager import OrderManager
from dotenv import load_dotenv
import os

load_dotenv()
api_key = os.getenv("api_key")
secret_key = os.getenv("secret_key")
base_url = os.getenv("base_url")

client = AlpacaClient(api_key, secret_key, base_url)
# account = client.api.get_account()
# print(f"Cash available: {account.cash}")
order_manager = OrderManager(client)

# Insert
# order, msg = order_manager.submit_order("BTCUSD", 0.03, Side.BUY, OrderType.MARKET)
# print(msg)
# order, msg = order_manager.submit_order("BTCUSD", 12, Side.BUY, OrderType.LIMIT, limit_price=1)
# print(msg)

# Delete Order 
# msg = order_manager.cancel_order("953c498f-9673-40df-ad52-2a147a46827b")
# print(msg)

import os
# import sys
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))
from backend.oms.alpaca_client import AlpacaClient
from backend.oms.order import Side, OrderType
from backend.oms.order_manager import OrderManager
from dotenv import load_dotenv
import backend.scripts.pollingAlpaca as polling_alpaca
import time

load_dotenv()
api_key = os.getenv("api_key")
secret_key = os.getenv("secret_key")
base_url = os.getenv("base_url")

client = AlpacaClient(api_key, secret_key, base_url)
# account = client.api.get_account()
# print(f"Cash available: {account.cash}")
order_manager = OrderManager(client)

# Insert
order, msg = order_manager.submit_order("ETHUSD", 0.02, Side.BUY, OrderType.MARKET)
print(msg)
# order, msg = order_manager.submit_order("ETHUSD", 15, Side.BUY, OrderType.LIMIT, limit_price=1)
# print(msg)

# Delete Order 
# msg = order_manager.cancel_order("953c498f-9673-40df-ad52-2a147a46827b")
# print(msg)

# Polling
polling_alpaca.start_polling()
time.sleep(30)
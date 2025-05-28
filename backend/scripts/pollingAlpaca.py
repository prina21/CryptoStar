import threading
import time
import os
import dotenv
import alpaca_trade_api as tradeapi
from backend.databases.dbOrders import update_order, get_open_orders

dotenv.load_dotenv()

api = tradeapi.REST(os.getenv('api_key'), os.getenv('secret_key'), os.getenv('base_url'))

def update_order_db():
    try:
        open_orders = get_open_orders()

        for order in open_orders:
            order_id = order.id
            alpaca_order_id = order.alpaca_order_id 
            print(f"Checking status for Alpaca order {alpaca_order_id} (Database Order ID: {order_id})")

            try:
                alpaca_order = api.get_order(alpaca_order_id)
                print(f"Alpaca order {alpaca_order_id} status: {alpaca_order.status}")
                
                if alpaca_order.status == 'filled':
                    update_order(order_id, 'FILLED')  
                    print(f"Order {alpaca_order_id} filled. Status updated in the database for Order ID: {order_id}.")
                else:
                    print(f"Order {alpaca_order_id} is still {alpaca_order.status}. No changes made to the database.")

            except Exception as e:
                print(f"Error fetching status for order {alpaca_order_id}: {e}")

    except Exception as e:
        print(f"Error checking and updating orders: {e}")

def continuously_update_orders():
    while True:
        update_order_db()
        open_orders = get_open_orders()
        if not open_orders:
            print("All orders are filled. Stopping polling.")
            break
        time.sleep(5)

def start_polling():
    polling_thread = threading.Thread(target=continuously_update_orders, daemon=True)
    polling_thread.start()
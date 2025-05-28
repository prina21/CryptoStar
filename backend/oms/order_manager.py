import os
# import sys
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from uuid import uuid4
from backend.oms.order import Order, OrderType, OrderStatus, Side
from alpaca_trade_api.rest import REST
from backend.oms.alpaca_client import AlpacaClient
from backend.databases import dbOrders as db

class OrderManager:
    def __init__(self, alpaca_client: AlpacaClient):
        self.client = alpaca_client
        self.orders = {}

    def submit_order(self, symbol, qty, side: Side, type_: OrderType, limit_price=None):
        order = Order(symbol, qty, side, type_, limit_price)

        try:
            if type_ == OrderType.MARKET:
                response = self.client.submit_market_order(symbol, qty, side.value)
            elif type_ == OrderType.LIMIT:
                response = self.client.submit_limit_order(symbol, qty, side.value, limit_price)
            else:
                order.status = OrderStatus.REJECTED
                return order, "Invalid order type"

            order.status = OrderStatus.SUBMITTED

            if hasattr(response, 'id'):
                alpaca_order_id = response.id
            else:
                raise ValueError("No Alpaca Id")

            order.alpaca_order_id = alpaca_order_id
            self.orders[order.id] = order
            # print("Order attributes:", dir(order))
            db.insert_order(order, alpaca_order_id)
            return order, f"Order submitted: {response.id}"
        except Exception as e:
            order.status = OrderStatus.REJECTED
            return order, f"Error: {str(e)}"
        

    def cancel_order(self, order_id):
        order = db.get_order(order_id)
        print("Order_id", order_id)

        if not order:
            return None, f"Order ID {order_id} not found"

        try:
            self.client.cancel_order(order.alpaca_order_id)
            print("Deleting order")
            db.cancel_order(order_id)
            order.status = OrderStatus.CANCELLED
            return order, f"Order {order_id} canceled successfully"
        except Exception as e:
            return order, f"Failed to cancel order {order_id}: {str(e)}"



    def amend_order(self, order_id, new_qty=None, new_limit_price=None):
        order = db.get_order(order_id)
        if not order:
            return None, f"Order ID {order_id} not found"
        if order.status != OrderStatus.SUBMITTED:
            return order, f"Order {order_id} is not amendable. Current status: {order.status.name}"
        try:
            self.client.cancel_order(order_id)
            order.status = OrderStatus.CANCELED
            updated_qty = new_qty if new_qty is not None else order.qty
            updated_price = new_limit_price if new_limit_price is not None else order.limit_price

            if order.type == OrderType.MARKET:
                response = self.client.submit_market_order(order.symbol, updated_qty, order.side.value)
            elif order.type == OrderType.LIMIT:
                response = self.client.submit_limit_order(order.symbol, updated_qty, order.side.value, updated_price)
            else:
                return order, f"Unsupported order type for amendment"
            new_order = Order(order.symbol, updated_qty, order.side, order.type, updated_price)
            new_order.status = OrderStatus.SUBMITTED
            self.orders[new_order.id] = new_order

            return new_order, f"Order amended successfully. New order ID: {response.id}"
        except Exception as e:
            return order, f"Failed to amend order {order_id}: {str(e)}"
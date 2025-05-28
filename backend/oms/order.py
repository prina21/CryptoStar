from enum import Enum
import uuid
import time


class Side(Enum):
    BUY = "buy"
    SELL = "sell"


class OrderType(Enum):
    MARKET = "market"
    LIMIT = "limit"


class OrderStatus(Enum):
    SUBMITTED = "SUBMITTED"
    FILLED = "FILLED"
    CANCELLED = "CANCELLED"
    REJECTED = "REJECTED"


class Order:
    def __init__(self, symbol, qty, side: Side, type_: OrderType, limit_price=None, alpaca_order_id=None):
        self.id = str(uuid.uuid4())
        self.alpaca_order_id = alpaca_order_id
        self.timestamp = time.time()
        self.symbol = symbol
        self.qty = qty
        self.side = side
        self.type = type_
        self.limit_price = limit_price
        self.status = OrderStatus.SUBMITTED

    def __repr__(self):
        return f"<Order {self.id[:6]} | {self.side.name} {self.qty} {self.symbol} @ {self.limit_price or 'market'}>"
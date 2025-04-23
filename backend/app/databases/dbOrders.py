from oms.order import Order, OrderStatus, Side, OrderType
from .postgresConnect import get_connection
import psycopg2

def get_order(order_id):
    conn = get_connection()
    cursor = conn.cursor(cursor_factory=psycopg2.extras.RealDictCursor)
    try:
        print("Fetching order function called")
        cursor.execute("""
            SELECT id, timestamp, symbol, qty, side, type, limit_price, status, alpaca_order_id
            FROM orders
            WHERE id = %s
        """, (order_id,))
        row = cursor.fetchone()
        if not row:
            print(f"No order found for id: {order_id}")
            return None

        print("Order row fetched:", row)

        order = Order(
            symbol=row["symbol"],
            qty=row["qty"],
            side=Side(row["side"]),
            type_=OrderType(row["type"]),
            limit_price=row["limit_price"]
        )
        order.id = row["id"]
        order.timestamp = row["timestamp"]
        order.status = OrderStatus(row["status"])
        order.alpaca_order_id = row["alpaca_order_id"]
        return order

    except Exception as e:
        print("Error fetching order:", e)
        return None
    finally:
        cursor.close()
        conn.close()

def insert_order(order, alpaca_order_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO orders (id, timestamp, symbol, qty, side, type, limit_price, status, alpaca_order_id)
        VALUES (%s, to_timestamp(%s), %s, %s, %s, %s, %s, %s, %s)""", 
        (
        order.id,
        order.timestamp,
        order.symbol,
        order.qty,
        order.side.value,
        order.type.value,
        order.limit_price,
        order.status.value,
        alpaca_order_id
    ))
    conn.commit()

def cancel_order(order_id):
    conn = get_connection()
    cursor = conn.cursor()
    try:
        print("Cancel Exceution called")
        cursor.execute("UPDATE orders SET status = %s WHERE id = %s", (OrderStatus.CANCELLED.value, order_id))
        conn.commit()
        print(f"Deleted order {order_id}")
    except Exception as e:
        print("Error deleting order:", e)
    finally: 
        conn.close()
        cursor.close()

    
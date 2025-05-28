# import os
# import sys
# sys.path.append(os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

# from fastapi import FastAPI, Request
# from fastapi.responses import JSONResponse
# from backend.databases.dbOrders import update_order
# import uvicorn
# import logging

# logging.basicConfig(level=logging.INFO)
# logger = logging.getLogger(__name__)

# app = FastAPI()

# @app.post("/webhook/alpaca")
# async def handle_webhook(request: Request):
#     try:
#         payload = await request.json()
#         logger.info(f"Received webhook payload: {payload}")

#         # if payload.get("event") == "fill":
#         # order = payload.get("order", {})
#         order_id = payload.get("id")
#         new_status = payload.get("status")
#         filled_price = payload.get("filled_avg_price")

#         if new_status == 'filled':
#             update_order(order_id, new_status, filled_price)
#             print(f"Order updated: {order_id} → {new_status}")
#         else:
#             print("Missing order ID or status")

#         return JSONResponse(content={"message": "Webhook received"}, status_code=200)

#     except Exception as e:
#         print(f"Webhook error: {e}")
#         return JSONResponse(content={"error": "Invalid webhook payload"}, status_code=400)


# if __name__ == "__main__":
#     uvicorn.run("webhook_receiver:app", host="0.0.0.0", port=8000, reload=True)



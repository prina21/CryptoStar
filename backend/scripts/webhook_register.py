# import requests
# from dotenv import load_dotenv
# import os

# load_dotenv()

# PAPER_BASE_URL = "https://paper-api.alpaca.markets"
# API_KEY = os.getenv("api_key")
# API_SECRET = os.getenv("secret_key")

# headers = {
#     "APCA-API-KEY-ID": os.getenv("api_key"),
#     "APCA-API-SECRET-KEY": os.getenv("secret_key")
# }

# webhook_url = "https://8307-128-195-97-133.ngrok-free.app/webhook/alpaca"
# # webhook_url = "https://webhook.site/199383ef-4834-453a-aafd-4036fb4f0b7c"

# config_url = f"{PAPER_BASE_URL}/v2/account/configurations"
# data = {"webhook": webhook_url}

# res = requests.patch(config_url, headers=headers, json=data)
# print(res.status_code, res.json())

from fastapi import APIRouter
import os
from dotenv import load_dotenv
import alpaca_trade_api 

load_dotenv()
router = APIRouter()
api = alpaca_trade_api.REST(os.getenv("api_key"), os.getenv("secret_key"), os.getenv("base_url"))
# accounts_api = alpaca_trade_api.REST(os.getenv("api_key"), os.getenv("secret_key"), os.getenv("accounts_url"))
# positions_api = alpaca_trade_api.REST(os.getenv("api_key"), os.getenv("secret_key"), os.getenv("positions_url"))

@router.get("/account/overview")
def get_account_overview():
    print("API called")
    try:
        account = api.get_account()
        positions = api.list_positions()

        total_cost = sum(float(pos.avg_entry_price) * float(pos.qty) for pos in positions)
        current_value = sum(float(pos.market_value) for pos in positions)
        profit_loss = current_value - total_cost

        return {
            "cash": account.cash,
            "portfolio_value": account.portfolio_value,
            "buying_power": account.buying_power,
            "profit_loss": round(profit_loss, 2),
            "positions": [{
                "symbol": pos.symbol,
                "qty": pos.qty,
                "market_value": pos.market_value,
                "avg_entry_price": pos.avg_entry_price,
                "unrealized_pl": pos.unrealized_pl
            } for pos in positions]
        }

    except Exception as e:
        return {"error": str(e)}
    

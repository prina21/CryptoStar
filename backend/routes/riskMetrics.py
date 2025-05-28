from fastapi import APIRouter, Depends
from fastapi.responses import JSONResponse
from databases.postgresConnect import get_connection
from databases.dbMetrics import fetch_latest_metrics

router = APIRouter()

@router.get("/api/risk-metrics")
def get_metrics():
    conn = get_connection()
    data = fetch_latest_metrics(conn)  # make sure this returns a dict
    return JSONResponse(content=data)
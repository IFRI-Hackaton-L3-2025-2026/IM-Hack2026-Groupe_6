from fastapi import APIRouter, Query
from app.services.data_loader import DataLoader
from datetime import datetime

router = APIRouter(prefix="/factory", tags=["Factory"])

data_loader = DataLoader("data/dataset.csv")


# 🔹 Snapshot temps réel (simulation)
@router.get("/realtime")
def realtime_snapshot():
    df = data_loader.get_all().tail(1)
    return df.to_dict(orient="records")


# 🔹 ROUTE HISTORIQUE (ÉTAPE 9)
@router.get("/history")
def get_history(date: str = Query(..., description="Format: YYYY-MM-DD")):
    
    df = data_loader.get_all()
    
    try:
        selected_date = datetime.strptime(date, "%Y-%m-%d").date()
        filtered = df[df["timestamp"].dt.date == selected_date]
        return filtered.to_dict(orient="records")
    
    except Exception:
        return {"error": "Invalid date format. Use YYYY-MM-DD"}
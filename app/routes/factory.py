from fastapi import APIRouter, HTTPException, Query
import pandas as pd
from app.services.data_loader import DataLoader
from datetime import datetime

router = APIRouter(prefix="/factory", tags=["Factory"])

data_loader = DataLoader("data/dataset.csv")


# 🔹 Snapshot temps réel (simulation)
@router.get("/realtime")
def realtime_snapshot():
    df = data_loader.get_all().tail(1)
    return df.to_dict(orient="records")


# 🔹 ROUTE HISTORIQUE 
@router.get("/history")
def get_history(date: str = Query(..., description="Format: YYYY-MM-DD")):

    df = data_loader.get_all()

    # 🔹 Sécurise le type datetime
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")

    try:
        selected_date = datetime.strptime(date, "%Y-%m-%d").date()
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid date format. Use YYYY-MM-DD"
        )

    # 🔹 Filtrage par date uniquement
    filtered = df[df["timestamp"].dt.date == selected_date]

    if filtered.empty:
        return {"message": "No data found for this date"}

    return filtered.to_dict(orient="records")

@router.get("/kpis")
def get_kpis():

    df = data_loader.get_all().tail(200)

    total = df["machine_id"].nunique()
    avg_temp = df["temperature"].mean()

    failure = df[df["temperature"] > 90].shape[0]
    maintenance = df[(df["temperature"] > 75) & (df["temperature"] <= 90)].shape[0]
    active = total - failure - maintenance

    most_critical = df.sort_values(
        by=["temperature", "vibration"],
        ascending=False
    ).iloc[0]["machine_id"]

    return {
        "total_machines": total,
        "active": active,
        "maintenance": maintenance,
        "failure": failure,
        "average_temperature": round(avg_temp, 2),
        "most_critical_machine": most_critical
    }

@router.get("/top-critical")
def top_critical():

    df = data_loader.get_all().tail(500)

    df["critical_score"] = (
        df["temperature"] * 0.5 +
        df["vibration"] * 0.3 +
        df["oil_particles"] * 0.2
    )

    top5 = df.sort_values(
        by="critical_score",
        ascending=False
    ).head(5)

    return top5[["machine_id", "critical_score"]].to_dict(orient="records")



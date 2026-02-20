from fastapi import APIRouter
from app.services.alert_service import AlertService
from app.services.data_loader import DataLoader

router = APIRouter(prefix="/alerts", tags=["Alerts"])
data_loader = DataLoader("data/dataset.csv")

@router.get("/")
def get_alerts():
    df = data_loader.get_all().tail(50)
    alerts_list = []

    for _, row in df.iterrows():
        alerts = AlertService.generate_alert(row)
        if alerts:
            alerts_list.append({
                "machine_id": row["machine_id"],
                "alerts": alerts,
                "timestamp": row["timestamp"]
            })

    return alerts_list
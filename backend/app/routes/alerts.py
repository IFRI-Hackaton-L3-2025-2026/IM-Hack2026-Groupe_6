from fastapi import APIRouter
from app.services.alert_service import AlertService
from app.services.data_loader import DataLoader

router = APIRouter(prefix="/alerts", tags=["Alertes et Notifications"])
data_loader = DataLoader("data/dataset.csv")

@router.get("/", summary="Liste des alertes actives", description="Analyse la dernière lecture de chaque machine et génère des alertes basées sur les seuils calibrés.")
def get_alerts():
    df = data_loader.get_all()

    # 🔹 Prendre la DERNIÈRE lecture de chaque machine (cohérent avec KPIs)
    latest_per_machine = (
        df.sort_values("timestamp")
        .groupby("machine_id", as_index=False)
        .last()
    )

    alerts_list = []
    for _, row in latest_per_machine.iterrows():
        alerts = AlertService.generate_alert(row)
        if alerts:
            alerts_list.append({
                "machine_id":   row["machine_id"],
                "machine_type": row.get("machine_type", "—"),
                "alerts":       alerts,
                "temperature":  round(float(row["temperature"]), 1),
                "vibration":    round(float(row["vibration"]), 2),
                "oil_particles": round(float(row["oil_particles"]), 1),
                "timestamp":    row["timestamp"],
            })

    # Trier par sévérité : HIGH d'abord, puis MEDIUM
    def severity_order(item):
        severities = [a["severity"] for a in item["alerts"]]
        return 0 if "HIGH" in severities else 1

    alerts_list.sort(key=severity_order)
    return alerts_list
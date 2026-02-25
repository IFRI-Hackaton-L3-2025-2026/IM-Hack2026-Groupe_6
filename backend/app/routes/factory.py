from fastapi import APIRouter, HTTPException, Query
import pandas as pd
from app.shared import data_loader
from datetime import datetime
from app.services.prediction_service import PredictionService

router = APIRouter(prefix="/factory", tags=["Usine (Factory)"])

# 🔹 Snapshot temps réel (simulation)
@router.get("/realtime", summary="Aperçu en temps réel", description="Récupère la dernière ligne de données pour simuler un flux en direct.")
def realtime_snapshot():
    df = data_loader.get_all().tail(1)
    return df.to_dict(orient="records")


# 🔹 ROUTE HISTORIQUE ET PRÉDICTIVE
@router.get("/history", summary="Historique et Prédiction", description="Récupère les données pour une date spécifique. Sans date, retourne le dernier instantané par machine.")
def get_history(
    date: str = Query(None, description="Format: AAAA-MM-JJ (optionnel)"),
    machine_id: str = Query(None, description="ID optionnel de la machine pour filtrer ou prédire")
):

    df = data_loader.get_all()
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")

    # 🔹 Mode globale : pas de date → dernier état de chaque machine
    if not date:
        latest_all = (
            df.sort_values("timestamp")
            .groupby("machine_id", as_index=False)
            .last()
        )
        if machine_id:
            latest_all = latest_all[latest_all["machine_id"] == machine_id]
        return latest_all[["machine_id", "machine_type", "timestamp", "temperature", "vibration", "current_mean", "oil_particles", "failure_next_24h"]].to_dict(orient="records")

    try:
        selected_date = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(status_code=400, detail="Format de date invalide. Utilisez AAAA-MM-JJ")

    max_date = df["timestamp"].max()

    # 🔹 Détection si la date est future
    if selected_date > max_date:
        if machine_id:
            machine_row = df[df["machine_id"] == machine_id]
            if machine_row.empty:
                raise HTTPException(status_code=404, detail=f"Machine {machine_id} non trouvée")
            machine_type = machine_row.iloc[0]["machine_type"]
            prediction = PredictionService.predict_machine_data(machine_id, machine_type, selected_date, df)
            return prediction
        else:
            return {
                "message": "La date demandée est future. Veuillez spécifier un machine_id pour obtenir une prédiction précise.",
                "max_dataset_date": max_date.strftime("%Y-%m-%d")
            }

    # 🔹 Filtrage par date
    filtered = df[df["timestamp"].dt.date == selected_date.date()]

    if machine_id:
        filtered = filtered[filtered["machine_id"] == machine_id]
        if filtered.empty:
            return {"message": f"Aucune donnée trouvée pour la machine '{machine_id}' à cette date."}
        return filtered.head(100).to_dict(orient="records")

    if filtered.empty:
        return {"message": "Aucune donnée trouvée pour cette date."}

    # 🔹 Vue résumée : une ligne par machine (dernière valeur de la journée)
    summary = (
        filtered.sort_values("timestamp")
        .groupby("machine_id", as_index=False)
        .last()
    )

    return summary[["machine_id", "machine_type", "timestamp", "temperature", "vibration", "current_mean", "oil_particles", "failure_next_24h"]].to_dict(orient="records")


# Seuils calibrés sur la distribution réelle du dataset BMI
# Température : p75 ≈ 63.3°C, p90 ≈ 75.7°C, max ≈ 82°C
TEMP_WARNING = 65.0   # Attention (Maintenance)
TEMP_CRITICAL = 75.0  # Critique (Panne)

@router.get("/kpis", summary="Indicateurs de Performance (KPIs)", description="Calcule les statistiques globales de l'usine (machines actives, en panne, température moyenne).")
def get_kpis():

    df = data_loader.get_all()

    # 🔹 Prendre la DERNIÈRE lecture de chaque machine
    latest_per_machine = (
        df.sort_values("timestamp")
        .groupby("machine_id", as_index=False)
        .last()
    )

    total = len(latest_per_machine)
    avg_temp = latest_per_machine["temperature"].mean()

    # 🔹 Classer chaque machine selon seuils calibrés sur le dataset
    failure_mask = latest_per_machine["temperature"] > TEMP_CRITICAL
    maintenance_mask = (latest_per_machine["temperature"] > TEMP_WARNING) & (latest_per_machine["temperature"] <= TEMP_CRITICAL)
    active_mask = latest_per_machine["temperature"] <= TEMP_WARNING

    failure = int(failure_mask.sum())
    maintenance = int(maintenance_mask.sum())
    active = int(active_mask.sum())

    most_critical = latest_per_machine.sort_values(
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

@router.get("/top-critical", summary="Top 5 des machines critiques", description="Identifie les 5 machines ayant le score de criticité le plus élevé.")
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



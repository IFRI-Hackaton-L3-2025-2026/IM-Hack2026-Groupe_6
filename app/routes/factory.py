from fastapi import APIRouter, HTTPException, Query
import pandas as pd
from app.services.data_loader import DataLoader
from datetime import datetime
from app.services.prediction_service import PredictionService

router = APIRouter(prefix="/factory", tags=["Usine (Factory)"])

data_loader = DataLoader("data/dataset.csv")

# 🔹 Snapshot temps réel (simulation)
@router.get("/realtime", summary="Aperçu en temps réel", description="Récupère la dernière ligne de données pour simuler un flux en direct.")
def realtime_snapshot():
    df = data_loader.get_all().tail(1)
    return df.to_dict(orient="records")


# 🔹 ROUTE HISTORIQUE ET PRÉDICTIVE
@router.get("/history", summary="Historique et Prédiction", description="Récupère les données pour une date spécifique. Si la date est future, simule une prédiction.")
def get_history(
    date: str = Query(..., description="Format: AAAA-MM-JJ"),
    machine_id: str = Query(None, description="ID optionnel de la machine pour filtrer ou prédire")
):

    df = data_loader.get_all()

    # 🔹 Sécurise le type datetime
    df["timestamp"] = pd.to_datetime(df["timestamp"], errors="coerce")

    try:
        selected_date = datetime.strptime(date, "%Y-%m-%d")
    except ValueError:
        raise HTTPException(
            status_code=400,
            detail="Invalid date format. Use YYYY-MM-DD"
        )

    max_date = df["timestamp"].max()

    # 🔹 Détection si la date est future
    if selected_date > max_date:
        if machine_id:
            # Prédiction pour une machine spécifique
            machine_row = df[df["machine_id"] == machine_id]
            if machine_row.empty:
                raise HTTPException(status_code=404, detail=f"Machine {machine_id} non trouvée")
            
            machine_type = machine_row.iloc[0]["machine_type"]
            prediction = PredictionService.predict_machine_data(machine_id, machine_type, selected_date, df)
            return prediction
        else:
            # Prédiction globale (message informatif car format multi-machine complexe)
            return {
                "message": "La date demandée est future. Veuillez spécifier un machine_id pour obtenir une prédiction précise.",
                "max_dataset_date": max_date.strftime("%Y-%m-%d")
            }

    # 🔹 Filtrage par date uniquement
    filtered = df[df["timestamp"].dt.date == selected_date.date()]
    
    if machine_id:
        filtered = filtered[filtered["machine_id"] == machine_id]

    if filtered.empty:
        return {"message": "No data found for this date"}

    return filtered.to_dict(orient="records")


@router.get("/kpis", summary="Indicateurs de Performance (KPIs)", description="Calcule les statistiques globales de l'usine (machines actives, en panne, température moyenne).")
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



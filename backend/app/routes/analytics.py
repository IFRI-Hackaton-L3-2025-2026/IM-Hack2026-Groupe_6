from fastapi import APIRouter
from app.services.data_loader import DataLoader
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytique Avancée"])

data_loader = DataLoader("data/dataset.csv")


# 🔹 KPI GLOBAL
@router.get("/kpis", summary="KPIs Globaux", description="Calcule les indicateurs clés de performance basés sur les 500 derniers relevés.")
def get_kpis():

    df = data_loader.get_all().tail(500)

    return AnalyticsService.compute_kpis(df)


# 🔹 TOP 5 MACHINES CRITIQUES
@router.get("/top-critical", summary="Machines les plus critiques", description="Retourne la liste des 5 machines nécessitant une intervention immédiate.")
def top_critical():

    df = data_loader.get_all().tail(500)

    return AnalyticsService.compute_top_critical(df)


# 🔹 HEATMAP CRITICITÉ
@router.get("/heatmap", summary="Carte de chaleur", description="Analyse de la distribution de la température et des vibrations.")
def heatmap():

    df = data_loader.get_all().tail(200)

    return AnalyticsService.compute_heatmap(df)


# 🔹 TIME SERIES POUR GRAFANA
@router.get("/machine-timeseries/{machine_id}", summary="Séries temporelles par machine", description="Génère des données formatées pour l'affichage de graphiques temporels.")
def machine_timeseries(machine_id: str):

    df = data_loader.get_by_machine(machine_id)

    return AnalyticsService.machine_timeseries(df)
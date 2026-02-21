from fastapi import APIRouter
from app.services.data_loader import DataLoader
from app.services.analytics_service import AnalyticsService

router = APIRouter(prefix="/analytics", tags=["Analytics"])

data_loader = DataLoader("data/dataset.csv")


# 🔹 KPI GLOBAL
@router.get("/kpis")
def get_kpis():

    df = data_loader.get_all().tail(500)

    return AnalyticsService.compute_kpis(df)


# 🔹 TOP 5 MACHINES CRITIQUES
@router.get("/top-critical")
def top_critical():

    df = data_loader.get_all().tail(500)

    return AnalyticsService.compute_top_critical(df)


# 🔹 HEATMAP CRITICITÉ
@router.get("/heatmap")
def heatmap():

    df = data_loader.get_all().tail(200)

    return AnalyticsService.compute_heatmap(df)


# 🔹 TIME SERIES POUR GRAFANA
@router.get("/machine-timeseries/{machine_id}")
def machine_timeseries(machine_id: str):

    df = data_loader.get_by_machine(machine_id)

    return AnalyticsService.machine_timeseries(df)
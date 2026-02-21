from fastapi import FastAPI
from app.routes import machines, factory, alerts, analytics, realtime_ws

app = FastAPI(
    title="API de Maintenance Prédictive - AI4BMI",
    description="Interface de programmation pour la surveillance en temps réel et l'analyse prédictive des machines industrielles. Développé par IM-Hack2026-Groupe_6.",
    version="1.0.0"
)

app.include_router(machines.router)
app.include_router(factory.router)
app.include_router(alerts.router)
app.include_router(analytics.router)
app.include_router(realtime_ws.router)
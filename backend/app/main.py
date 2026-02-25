from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import machines, factory, alerts, analytics, realtime_ws

app = FastAPI(
    title="AI4BMI Predictive Maintenance API",
    description="Interface de programmation pour la surveillance en temps réel et l'analyse prédictive des machines industrielles. Développé par IM-Hack2026-Groupe_6.",
    version="1.0.0"
)

# Configuration CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def read_root():
    return {"status": "ok", "message": "AI4BMI API is running"}

app.include_router(machines.router)
app.include_router(factory.router)
app.include_router(alerts.router)
app.include_router(analytics.router)
app.include_router(realtime_ws.router)
from fastapi import FastAPI
from app.routes import machines, factory, alerts, analytics, realtime_ws

app = FastAPI(title="AI4BMI Predictive Maintenance API")

app.include_router(machines.router)
app.include_router(factory.router)
app.include_router(alerts.router)
app.include_router(analytics.router)
app.include_router(realtime_ws.router)
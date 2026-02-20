from fastapi import FastAPI
from app.routes import machines, alerts, factory

app = FastAPI(title="AI4BMI Predictive Maintenance API")

app.include_router(machines.router)
app.include_router(alerts.router)
app.include_router(factory.router)  
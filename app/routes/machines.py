from fastapi import APIRouter
from app.services.data_loader import DataLoader
from app.services.machine_service import MachineService

router = APIRouter(prefix="/machines", tags=["Machines"])

data_loader = DataLoader("data/dataset.csv")

@router.get("/")
def get_all_machines():
    df = data_loader.get_all()
    return df.tail(100).to_dict(orient="records")

@router.get("/{machine_id}")
def get_machine_data(machine_id: str):
    df = data_loader.get_by_machine(machine_id)
    return df.tail(50).to_dict(orient="records")
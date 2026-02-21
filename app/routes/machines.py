from fastapi import APIRouter
from app.services.data_loader import DataLoader
from app.services.machine_service import MachineService

router = APIRouter(prefix="/machines", tags=["Gestion des Machines"])

data_loader = DataLoader("data/dataset.csv")

@router.get("/", summary="Liste des machines", description="Récupère les dernières données enregistrées pour l'ensemble du parc machine.")
def get_all_machines():
    df = data_loader.get_all()
    return df.tail(100).to_dict(orient="records")

@router.get("/{machine_id}", summary="Données spécifiques d'une machine", description="Récupère les 50 derniers relevés pour une machine donnée via son identifiant.")
def get_machine_data(machine_id: str):
    df = data_loader.get_by_machine(machine_id)
    return df.tail(50).to_dict(orient="records")
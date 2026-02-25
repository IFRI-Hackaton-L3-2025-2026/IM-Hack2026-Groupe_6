from app.services.data_loader import DataLoader
import os

# On utilise une instance partagée pour économiser la mémoire sur Render (Free Tier)
# On définit le chemin absolu pour éviter les surprises selon le point d'entrée
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
DATA_PATH = os.path.join(BASE_DIR, "data", "dataset.csv")

data_loader = DataLoader(DATA_PATH)

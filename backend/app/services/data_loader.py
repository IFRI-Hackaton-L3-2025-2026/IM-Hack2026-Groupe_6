import pandas as pd

class DataLoader:
    def __init__(self, path: str):
        self.df = pd.read_csv(path, parse_dates=["timestamp"])
        
        # 🔹 Renommage des colonnes pour correspondre au code existant
        rename_map = {
            "temp_mean": "temperature",
            "vib_mean": "vibration",
            "current_mean": "current",
            "oil_particle_count": "oil_particles"
        }
        self.df = self.df.rename(columns=rename_map)
    
    def get_all(self):
        return self.df

    def get_by_machine(self, machine_id: str):
        return self.df[self.df["machine_id"] == machine_id]

    def get_at_date(self, date):
        return self.df[self.df["timestamp"] == date]
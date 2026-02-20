import pandas as pd

class DataLoader:
    def __init__(self, path: str):
        self.df = pd.read_csv(path, parse_dates=["timestamp"])
    
    def get_all(self):
        return self.df

    def get_by_machine(self, machine_id: str):
        return self.df[self.df["machine_id"] == machine_id]

    def get_at_date(self, date):
        return self.df[self.df["timestamp"] == date]
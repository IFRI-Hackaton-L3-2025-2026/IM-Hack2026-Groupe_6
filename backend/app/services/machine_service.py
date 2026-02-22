import random

class MachineService:

    @staticmethod
    def compute_status(row):
        if row["temperature"] > 90 and row["vibration"] > 80:
            return "FAILURE"
        elif row["temperature"] > 75:
            return "MAINTENANCE"
        elif row["rpm"] == 0:
            return "IDLE"
        else:
            return "ACTIVE"
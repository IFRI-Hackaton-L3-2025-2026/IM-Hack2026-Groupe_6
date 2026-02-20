class AlertService:

    @staticmethod
    def generate_alert(row):
        alerts = []

        if row["temperature"] > 90:
            alerts.append("High temperature detected")

        if row["vibration"] > 85:
            alerts.append("Abnormal vibration level")

        if row["oil_particles"] > 50:
            alerts.append("Metal particles detected in oil")

        return alerts
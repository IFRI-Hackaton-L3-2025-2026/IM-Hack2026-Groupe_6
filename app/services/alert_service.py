class AlertService:

    @staticmethod
    def generate_alert(row):

        alerts = []

        if row["temperature"] > 90:
            alerts.append({
                "type": "TEMPERATURE",
                "severity": "HIGH"
            })

        if row["vibration"] > 85:
            alerts.append({
                "type": "VIBRATION",
                "severity": "MEDIUM"
            })

        if row["oil_particles"] > 50:
            alerts.append({
                "type": "OIL_CONTAMINATION",
                "severity": "HIGH"
            })

        return alerts
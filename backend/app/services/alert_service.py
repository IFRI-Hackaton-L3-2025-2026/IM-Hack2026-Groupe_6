# Seuils calibrés sur la distribution réelle du dataset BMI
# Température : p75≈63.3°C, p90≈75.7°C, max≈82°C
TEMP_WARNING  = 65.0   # Attention / Maintenance
TEMP_CRITICAL = 75.0   # Critique / Panne imminente

# Vibration : p75≈5.7 Hz, p90≈6.3 Hz, max≈9.3 Hz
VIB_WARNING   = 5.5
VIB_CRITICAL  = 6.5

# Particules d'huile : p75≈64, p90≈76, max≈144
OIL_WARNING   = 60
OIL_CRITICAL  = 80


class AlertService:

    @staticmethod
    def generate_alert(row):

        alerts = []

        # Alerte Température
        if row["temperature"] > TEMP_CRITICAL:
            alerts.append({"type": "TEMPÉRATURE CRITIQUE", "severity": "HIGH"})
        elif row["temperature"] > TEMP_WARNING:
            alerts.append({"type": "TEMPÉRATURE ÉLEVÉE", "severity": "MEDIUM"})

        # Alerte Vibration
        if row["vibration"] > VIB_CRITICAL:
            alerts.append({"type": "VIBRATION CRITIQUE", "severity": "HIGH"})
        elif row["vibration"] > VIB_WARNING:
            alerts.append({"type": "VIBRATION ÉLEVÉE", "severity": "MEDIUM"})

        # Alerte Particules d'huile
        if row["oil_particles"] > OIL_CRITICAL:
            alerts.append({"type": "CONTAMINATION HUILE", "severity": "HIGH"})
        elif row["oil_particles"] > OIL_WARNING:
            alerts.append({"type": "HUILE À SURVEILLER", "severity": "MEDIUM"})

        return alerts
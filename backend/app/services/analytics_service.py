from typing import List, Dict
import pandas as pd
import numpy as np

# Seuils calibrés (cohérents avec alert_service.py)
TEMP_WARNING  = 65.0
TEMP_CRITICAL = 75.0

class AnalyticsService:

    @staticmethod
    def compute_kpis(df: pd.DataFrame) -> Dict:
        """Calcule la santé globale de l'usine basée sur les dernières données par machine."""
        
        # Prendre la dernière lecture par machine présente dans le slice df
        latest = df.sort_values("timestamp").groupby("machine_id").last()
        total = len(latest)
        
        # Calcul de l'efficience basé sur le ratio de machines sans alerte
        fail_count = (latest["temperature"] > TEMP_CRITICAL).sum()
        maint_count = ((latest["temperature"] > TEMP_WARNING) & (latest["temperature"] <= TEMP_CRITICAL)).sum()
        
        # Score de santé : 100% si tout est ok, -10% par panne, -2% par maintenance
        health_score = 100 - (fail_count * 15) - (maint_count * 5)
        health_score = max(0, min(100, health_score))

        return {
            "efficiency": round(float(health_score), 1),
            "total_machines": int(total),
            "machines_at_risk": int(fail_count + maint_count),
            "avg_temp": round(float(latest["temperature"].mean()), 1),
            "avg_vibration": round(float(latest["vibration"].mean()), 2)
        }

    @staticmethod
    def compute_heatmap(df: pd.DataFrame) -> List[Dict]:
        """Groupe les machines par type pour la Heatmap ApexCharts."""
        
        latest = df.sort_values("timestamp").groupby("machine_id").last().reset_index()
        
        # Structure attendue par ApexCharts Heatmap: [{ name: 'Type', data: [{ x: 'Machine', y: Value }] }]
        result = []
        for m_type in latest["machine_type"].unique():
            type_data = latest[latest["machine_type"] == m_type]
            data_points = []
            for _, row in type_data.iterrows():
                # Score de chaleur basé sur la température normalisée (0-100)
                # On considère 30°C comme froid et 80°C comme critique
                val = (row["temperature"] - 30) / (80 - 30) * 100
                data_points.append({
                    "x": row["machine_id"],
                    "y": round(max(0, min(100, val)), 1)
                })
            
            result.append({
                "name": m_type,
                "data": data_points
            })
            
        return result

    @staticmethod
    def compute_top_critical(df: pd.DataFrame) -> List[Dict]:
        """Identifie les machines les plus instables (vibrations + température)."""
        latest = df.sort_values("timestamp").groupby("machine_id").last().reset_index()
        
        latest["critical_score"] = (
            (latest["temperature"] / TEMP_CRITICAL) * 60 + 
            (latest["vibration"] / 6.5) * 40
        )
        
        top = latest.sort_values("critical_score", ascending=False).head(5)
        return top[["machine_id", "critical_score", "machine_type"]].to_dict(orient="records")

    @staticmethod
    def machine_timeseries(df: pd.DataFrame) -> List[Dict]:
        """Retourne l'évolution de la température pour une machine."""
        df = df.sort_values("timestamp")
        return [
            {
                "time": row["timestamp"].isoformat() if hasattr(row["timestamp"], "isoformat") else str(row["timestamp"]),
                "temp": round(float(row["temperature"]), 1),
                "vib": round(float(row["vibration"]), 2)
            }
            for _, row in df.iterrows()
        ]
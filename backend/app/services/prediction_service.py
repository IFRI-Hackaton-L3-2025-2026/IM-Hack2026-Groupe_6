import pandas as pd
import numpy as np
from datetime import datetime

class PredictionService:
    @staticmethod
    def predict_machine_data(machine_id: str, machine_type: str, target_date: datetime, df: pd.DataFrame):
        """
        Génère une prédiction pour une machine à une date future.
        Formule : Valeur_future = Moyenne_30j + (Tendance * Nombre_jours_projection)
        """
        # Filtrer pour la machine spécifique
        machine_df = df[df["machine_id"] == machine_id].copy()
        if machine_df.empty:
            return None

        # Convertir timestamp en datetime si ce n'est pas déjà fait
        machine_df["timestamp"] = pd.to_datetime(machine_df["timestamp"])
        machine_df = machine_df.sort_values("timestamp")

        max_date = machine_df["timestamp"].max()
        
        # Calculer le nombre de jours de projection
        projection_days = (target_date - max_date).days
        if projection_days <= 0:
            return None  # Devrait être géré par l'historique

        # Prendre les 30 derniers jours (ou les 30 derniers points si données éparses)
        # On va simplifier en prenant les 30 dernières lignes pour la tendance
        last_30_points = machine_df.tail(30)
        
        indicators = ["temperature", "vibration", "current_mean"]
        # On s'assure que les colonnes existent (current_mean est dans le csv, temperature et vibration ont été renommées dans DataLoader)
        
        predictions = {}
        for col in indicators:
            if col in last_30_points.columns:
                mean_30 = last_30_points[col].mean()
                
                # Calcul de la tendance (pente par régression linéaire simple)
                # x = index de temps (en jours par rapport au début des 30 points)
                x = (last_30_points["timestamp"] - last_30_points["timestamp"].min()).dt.total_seconds() / (24 * 3600)
                y = last_30_points[col].values
                
                if len(x) > 1:
                    slope, _ = np.polyfit(x, y, 1)
                else:
                    slope = 0
                
                predicted_val = mean_30 + (slope * projection_days)
                predictions[col] = max(0, predicted_val) # Pas de valeurs négatives
            else:
                predictions[col] = 0

        # Déterminer le statut
        temp = predictions.get("temperature", 0)
        if temp > 90:
            statut = "Risque élevé"
            confiance = 75
        elif temp > 75:
            statut = "Risque modéré"
            confiance = 87
        else:
            statut = "Actif"
            confiance = 95

        # Ajuster le niveau de confiance selon la distance
        # Plus on est loin dans le futur, moins on a confiance (ex: -1% par mois)
        confiance = max(50, confiance - (projection_days // 30))

        return {
            "date_recherche": target_date.strftime("%d/%m/%Y"),
            "type_donnees": "Prédiction (hors dataset historique)",
            "equipement": f"{machine_type} {machine_id} - ID: {machine_id}",
            "temperature_estimee": f"{round(predictions.get('temperature', 0), 1)} °C",
            "vibration_estimee": f"{round(predictions.get('vibration', 0), 1)} mm/s",
            "courant_estime": f"{round(predictions.get('current_mean', 0), 1)} A",
            "statut_estime": statut,
            "niveau_confiance": f"{confiance}%",
            "message": f"⚠️ La date sélectionnée dépasse la plage des données historiques disponibles ({machine_df['timestamp'].min().strftime('%d/%m/%Y')} – {max_date.strftime('%d/%m/%Y')}). Les informations affichées correspondent à une projection prédictive basée sur les tendances observées. Niveau de confiance estimé : {confiance}%"
        }

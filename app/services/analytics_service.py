from typing import List, Dict
import pandas as pd


class AnalyticsService:

    @staticmethod
    def compute_kpis(df: pd.DataFrame) -> Dict:

        total = df["machine_id"].nunique()
        avg_temp = df["temperature"].mean()

        failure = df[df["temperature"] > 90]["machine_id"].nunique()
        maintenance = df[
            (df["temperature"] > 75) &
            (df["temperature"] <= 90)
        ]["machine_id"].nunique()

        active = total - failure - maintenance

        most_critical_row = df.sort_values(
            by=["temperature", "vibration"],
            ascending=False
        ).iloc[0]

        return {
            "total_machines": total,
            "active": active,
            "maintenance": maintenance,
            "failure": failure,
            "average_temperature": round(avg_temp, 2),
            "most_critical_machine": most_critical_row["machine_id"]
        }

    @staticmethod
    def compute_top_critical(df: pd.DataFrame) -> List[Dict]:

        df["critical_score"] = (
            df["temperature"] * 0.5 +
            df["vibration"] * 0.3 +
            df["oil_particles"] * 0.2
        )

        top5 = df.sort_values(
            by="critical_score",
            ascending=False
        ).head(5)

        return top5[
            ["machine_id", "critical_score"]
        ].to_dict(orient="records")

    @staticmethod
    def compute_heatmap(df: pd.DataFrame) -> List[Dict]:

        heat_data = []

        for _, row in df.iterrows():

            score = (
                row["temperature"] * 0.4 +
                row["vibration"] * 0.4 +
                row["oil_particles"] * 0.2
            )

            heat_data.append({
                "machine_id": row["machine_id"],
                "criticality": round(score, 2)
            })

        return heat_data

    @staticmethod
    def machine_timeseries(df: pd.DataFrame) -> List[Dict]:

        result = []

        for _, row in df.iterrows():
            result.append({
                "time": row["timestamp"],
                "value": row["temperature"]
            })

        return result
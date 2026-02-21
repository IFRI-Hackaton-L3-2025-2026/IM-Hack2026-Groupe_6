# AI4BMI - Plateforme de Maintenance Prédictive
# IM-Hack2026-Groupe_6

Bienvenue sur le dépôt du projet **AI4BMI**, une solution backend de maintenance prédictive pour l'industrie, développée par le groupe **IM-Hack2026-Groupe_6**.

## 🚀 À propos du projet

Cette plateforme est conçue pour surveiller l'état de santé des machines industrielles en temps réel. Elle exploite des données de capteurs pour prédire les pannes potentielles et optimiser les interventions de maintenance.

## 🛠️ Stack Technique & Packages

Le projet utilise les packages Python suivants (voir `requirements.txt`) :
- **FastAPI** : Framework web haute performance.
- **Uvicorn** : Serveur ASGI pour FastAPI.
- **Pandas** : Manipulation et analyse de données.
- **WebSockets** : Pour la diffusion de données en temps réel.

## 📌 Fonctionnalités de l'App

L'API de **IM-Hack2026-Groupe_6** propose :

- **Dashboard Factory** (`/factory`) : KPIs, temps réel et historique.
- **Gestion des Machines** (`/machines`) : Suivi individuel des équipements.
- **Service d'Alertes** (`/alerts`) : Détection automatique des anomalies critiques.
- **Analytics** (`/analytics`) : Analyse des tendances et prédictions.
- **Flux Temps Réel** : Connexion via WebSocket pour un monitoring continu.

## 📥 Installation

1. **Clonage du projet :**
```bash
git clone https://github.com/IFRI-Hackaton-L3-2025-2026/IM-Hack2026-Groupe_6.git
cd IM-Hack2026-Groupe_6
```

2. **Configuration de l'environnement :**
```bash
python -m venv venv
./venv/Scripts/activate  # Windows
pip install -r requirements.txt
```

## 🏃 Lancement

Démarrez l'application avec :
```bash
uvicorn app.main:app --reload
```
Accès à la documentation interactive : `http://127.0.0.1:8000/docs`

---
*Projet réalisé dans le cadre de l'IM-Hack 2026 par le **Groupe 6**.*

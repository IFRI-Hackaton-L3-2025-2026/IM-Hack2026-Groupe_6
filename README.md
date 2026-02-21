# AI4BMI - Plateforme de Maintenance Prédictive
# IM-Hack2026-Groupe_6

Bienvenue sur le dépôt du projet **AI4BMI**, une solution backend avancée de maintenance prédictive pour l'industrie, développée par le groupe **IM-Hack2026-Groupe_6**.

## À propos du projet

Cette plateforme est conçue pour surveiller l'état de santé des machines industrielles en temps réel. Elle exploite des données de capteurs (température, vibrations, consommation électrique) pour prédire les pannes potentielles et optimiser les interventions de maintenance.

Le système intègre désormais un **moteur de simulation intelligente** capable de projeter l'état futur des équipements en fonction des tendances historiques.

##  Stack Technique

*   **FastAPI** : Framework web haute performance pour l'API.
*   **Uvicorn** : Serveur ASGI pour FastAPI.
*   **Pandas** : Analyse et manipulation de séries temporelles massives.
*   **Numpy** : Calculs mathématiques avancés et régressions linéaires.
*   **WebSockets** : Diffusion bidirectionnelle de données pour le monitoring en direct.

##  Algorithme de Simulation Prédictive

L'une des innovations majeures de cette version est la gestion des dates hors dataset. Lorsqu'un utilisateur interroge l'API pour une date future (ex: 2026), le système bascule automatiquement en **mode simulation**.

### La Logique de Calcul
Nous utilisons une projection linéaire basée sur les 30 derniers jours de données réelles :

$$Valeur\_future = Moyenne_{30j} + (Tendance \times Nombre\_jours\_projection)$$

*   **Moyenne 30j** : Établit la ligne de base actuelle de la machine.
*   **Tendance** : Calculée par régression linéaire (`polyfit`) sur la série temporelle récente pour détecter une usure progressive.
*   **Indicateurs simulés** : Température moteur, Vibration (mm/s), Consommation (A).
*   **Niveau de confiance** : Calculé dynamiquement (décroissance temporelle) pour refléter l'incertitude des prédictions à long terme.

##  Fonctionnalités de l'API

L'API de **IM-Hack2026-Groupe_6** propose les services suivants :

*   **Dashboard Factory** (`/factory`) :
    *   `GET /factory/realtime` : Derniers relevés globaux.
    *   `GET /factory/history` : Accès aux archives **OU** génération de prédictions si la date est future.
    *   `GET /factory/kpis` : Indicateurs globaux (moyennes, machines critiques).
*   **Gestion des Machines** (`/machines`) : Suivi granulaire par identifiant (`machine_id`).
*   **Service d'Alertes** (`/alerts`) : Liste des anomalies détectées.
*   **Analytics** (`/analytics`) : Graphiques de séries temporelles et cartes de chaleur de criticité.
*   **Flux Temps Réel** : Monitoring continu via WebSockets.

##  Installation & Lancement

### 1. Préparation de l'environnement
```powershell
# Clonage
git clone https://github.com/IFRI-Hackaton-L3-2025-2026/IM-Hack2026-Groupe_6.git
cd IM-Hack2026-Groupe_6

# Création du venv
python -m venv venv
.\venv\Scripts\activate  # Windows
```

### 2. Installation des dépendances
```powershell
pip install -r requirements.txt
pip install numpy  # Si non présent dans requirements
```

### 3. Démarrage du serveur
```powershell
uvicorn app.main:app --reload
```

Accès à la documentation interactive : [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)

---
*Projet réalisé dans le cadre de l'IM-Hack 2026 par le **Groupe 6**.*

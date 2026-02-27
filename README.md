# AI4BMI - Plateforme de Maintenance Prédictive
# IM-Hack2026-Groupe_6

Bienvenue sur le dépôt du projet **AI4BMI**, une solution complète de maintenance prédictive (Backend + Dashboard) pour l'industrie, développée par le groupe **IM-Hack2026-Groupe_6**.

---

##  Accès Rapide aux Déploiements

| Interface | URL |
| :--- | :--- |
| ** Interface Utilisateur (Vercel)** | [Voir le Dashboard Live](https://im-hack2026-groupe-6-fxtxrpzoy-olympblacks-projects.vercel.app/) |
| ** Documentation API (Render)** | [Accéder à Swagger UI](https://im-hack2026-groupe-6-1.onrender.com/docs) |
| ** Statut du Backend** | [Vérifier le Service](https://im-hack2026-groupe-6-1.onrender.com/) |
| ** Vidéo démo sur Youtube ** | [Régarder la vidéo démo](https://youtu.be/MUsKffLshkY) |
---

##  Installation & Lancement Local

Le projet est divisé en deux parties indépendantes : un backend FastAPI et un frontend React (Vite).

###  1. Lancement du Backend (API)

```powershell
# Accéder au dossier backend
cd backend

# Création et activation de l'environnement virtuel
python -m venv venv
.\venv\Scripts\activate  # Windows

# Installation des dépendances
pip install -r requirements.txt

# Démarrage du serveur uvicorn
uvicorn app.main:app --port 8000 --reload
```
*Note : Le serveur sera disponible sur [http://localhost:8000](http://localhost:8000)*

---

### 💻 2. Lancement du Frontend (Dashboard)

```powershell
# Accéder au dossier frontend
cd frontend

# Installation des paquets
npm install

# Démarrage du serveur de développement
npm run dev
```
*Note : L'interface sera disponible sur [http://localhost:5173](http://localhost:5173)*

---

##  Stack Technique

*   **Backend** : FastAPI, Uvicorn, Pandas, Numpy, WebSockets.
*   **Frontend** : React.js, Vite, Tailwind CSS, ApexCharts, Three.js (Visualisation 3D).

## 🔮 Innovation Majeure : Moteur de Prédiction
L'une des innovations phares est la gestion des **dates futures**. Lorsqu'un utilisateur interroge l'API pour une date hors dataset (ex: 2026), le système calcule une **projection linéaire** basée sur les 30 derniers jours de données réelles pour estimer l'état thermique et vibratoire futur des machines.

---
*Projet réalisé dans le cadre de l'IM-Hack 2026 par le **Groupe 6**.*

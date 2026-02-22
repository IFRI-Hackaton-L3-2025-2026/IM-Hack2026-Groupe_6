# Utiliser une image Python officielle
FROM python:3.11-slim

# Définir le répertoire de travail
WORKDIR /app

# Installer les dépendances système nécessaires pour Pandas si besoin
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Copier le fichier requirements.txt
COPY requirements.txt .

# Installer les dépendances Python
RUN pip install --no-cache-dir -r requirements.txt

# Copier le reste du code
COPY . .

# Exposer le port (Render utilise généralement 10000 par défaut, mais il vaut mieux utiliser la variable d'env)
EXPOSE 8000

# Commande pour démarrer l'application sur le port fourni par Render ($PORT)
# Si $PORT n'est pas défini, on utilise 8000 par défaut.
CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"]

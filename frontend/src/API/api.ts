import axios from "axios";

// En production, Vite utilise les variables d'environnement préfixées par VITE_
// On garde localhost:8000 comme valeur par défaut pour le développement
const API_URL = "https://im-hack2026-groupe-6-1.onrender.com/";

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});
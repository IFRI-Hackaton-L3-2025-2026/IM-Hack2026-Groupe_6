import axios from "axios";

// En production, Vite utilise les variables d'environnement préfixées par VITE_
// On nettoie l'URL pour éviter les double slashes
const getApiUrl = () => {
    const envUrl = import.meta.env.VITE_API_URL;
    if (envUrl) return envUrl.replace(/\/$/, "");

    const isLocal = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";
    if (isLocal) return "http://localhost:8000";

    // URL de secours pour Render (sans slash final)
    return "https://im-hack2026-groupe-6-1.onrender.com";
};

const API_URL = getApiUrl();

export const api = axios.create({
    baseURL: API_URL,
    headers: {
        "Content-Type": "application/json"
    }
});
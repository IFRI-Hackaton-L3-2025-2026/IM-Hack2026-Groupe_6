import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from "react";

interface AuthState {
    isAuthenticated: boolean;
    user: { email: string; name: string } | null;
}

interface AuthContextType extends AuthState {
    login: (email: string, password: string) => boolean;
    logout: () => void;
}

// ─── Demo credentials ────────────────────────────────────────────────────────
const DEMO_EMAIL = "admin@ai4bmi.com";
const DEMO_PASSWORD = "Admin2026!";
const DEMO_NAME = "Admin BMI";
const STORAGE_KEY = "ai4bmi_auth";

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [state, setState] = useState<AuthState>(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved) as AuthState;
                if (parsed.isAuthenticated && parsed.user) return parsed;
            }
        } catch { /* ignore */ }
        return { isAuthenticated: false, user: null };
    });

    // Persist to localStorage
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    }, [state]);

    const login = useCallback((email: string, password: string): boolean => {
        if (email === DEMO_EMAIL && password === DEMO_PASSWORD) {
            setState({ isAuthenticated: true, user: { email: DEMO_EMAIL, name: DEMO_NAME } });
            return true;
        }
        return false;
    }, []);

    const logout = useCallback(() => {
        setState({ isAuthenticated: false, user: null });
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    return (
        <AuthContext.Provider value={{ ...state, login, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth must be used within AuthProvider");
    return ctx;
}

// Export credentials for display on login card
export const CREDENTIALS = { email: DEMO_EMAIL, password: DEMO_PASSWORD };

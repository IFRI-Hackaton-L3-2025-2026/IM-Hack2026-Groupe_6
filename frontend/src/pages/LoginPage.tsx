import { useState, FormEvent } from "react";
import { useAuth, CREDENTIALS } from "../context/AuthContext";

export default function LoginPage() {
    const { login } = useAuth();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [showPwd, setShowPwd] = useState(false);

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email.trim() || !password.trim()) {
            setError("Veuillez remplir tous les champs.");
            return;
        }
        const ok = login(email.trim(), password);
        if (!ok) setError("Email ou mot de passe incorrect.");
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-950 px-4">
            {/* Centered card */}
            <div className="w-full max-w-md">

                {/* Logo */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-black tracking-tighter text-gray-900 dark:text-white">
                        AI4<span className="text-brand-500">BMI</span>
                    </h1>
                    <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                        Système de maintenance prédictive
                    </p>
                </div>

                {/* Login card */}
                <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-theme-sm p-8">
                    <h2 className="text-lg font-semibold text-gray-800 dark:text-white mb-1">
                        Connexion
                    </h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
                        Connectez-vous pour accéder au tableau de bord.
                    </p>

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        {/* Email */}
                        <div>
                            <label htmlFor="login-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Email
                            </label>
                            <input
                                id="login-email"
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="admin@ai4bmi.com"
                                autoComplete="email"
                                className="h-11 w-full rounded-lg border border-gray-200 bg-transparent px-4 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                            />
                        </div>

                        {/* Password */}
                        <div>
                            <label htmlFor="login-password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                                Mot de passe
                            </label>
                            <div className="relative">
                                <input
                                    id="login-password"
                                    type={showPwd ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete="current-password"
                                    className="h-11 w-full rounded-lg border border-gray-200 bg-transparent px-4 pr-11 text-sm text-gray-800 shadow-theme-xs placeholder:text-gray-400 focus:border-brand-300 focus:outline-hidden focus:ring-3 focus:ring-brand-500/10 dark:border-gray-800 dark:bg-white/[0.03] dark:text-white/90 dark:placeholder:text-white/30 dark:focus:border-brand-800"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPwd(!showPwd)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    tabIndex={-1}
                                >
                                    {showPwd ? (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
                                            <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
                                            <line x1="1" y1="1" x2="23" y2="23" />
                                        </svg>
                                    ) : (
                                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                            <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                                            <circle cx="12" cy="12" r="3" />
                                        </svg>
                                    )}
                                </button>
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <p className="text-sm text-error-600 dark:text-error-400 bg-error-50 dark:bg-error-500/10 px-3 py-2 rounded-lg">
                                {error}
                            </p>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            className="h-11 w-full rounded-lg bg-brand-500 text-white text-sm font-semibold shadow-theme-xs hover:bg-brand-600 active:scale-[0.98] transition-all duration-150"
                        >
                            Se connecter
                        </button>
                    </form>
                </div>

                {/* Credentials helper card */}
                <div className="mt-4 rounded-xl bg-brand-50/60 dark:bg-brand-500/5 border border-brand-100 dark:border-brand-900/30 px-5 py-4">
                    <p className="text-xs font-semibold text-brand-700 dark:text-brand-400 uppercase tracking-wider mb-2.5">
                        Identifiants de démonstration
                    </p>
                    <div className="flex flex-col gap-1.5 font-mono text-sm">
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400 text-xs w-14">Email</span>
                            <span className="text-gray-800 dark:text-white/90 font-medium select-all">{CREDENTIALS.email}</span>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className="text-gray-500 dark:text-gray-400 text-xs w-14">Mdp</span>
                            <span className="text-gray-800 dark:text-white/90 font-medium select-all">{CREDENTIALS.password}</span>
                        </div>
                    </div>
                </div>

                <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
                    © 2026 AI4BMI · Groupe 6 · IFRI L3
                </p>
            </div>
        </div>
    );
}

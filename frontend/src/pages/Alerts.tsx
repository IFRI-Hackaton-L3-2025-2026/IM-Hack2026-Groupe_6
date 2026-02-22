import { useEffect, useState, useCallback } from "react";
import PageMeta from "../components/common/PageMeta";
import { api } from "../API/api";

interface AlertItem {
    type: string;
    severity: "HIGH" | "MEDIUM";
}

interface MachineAlert {
    machine_id: string;
    machine_type: string;
    alerts: AlertItem[];
    temperature: number;
    vibration: number;
    oil_particles: number;
    timestamp: string;
}

export default function AlertsPage() {
    const [all, setAll] = useState<MachineAlert[]>([]);
    const [filter, setFilter] = useState<"ALL" | "HIGH" | "MEDIUM">("ALL");
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [lastUpdate, setLastUpdate] = useState<Date | null>(null);

    const fetchAlerts = useCallback(async () => {
        try {
            const { data } = await api.get("/alerts/");
            setAll(data);
            setLastUpdate(new Date());
        } catch {
            // silently fail, keep stale data
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchAlerts();
        const id = setInterval(fetchAlerts, 15000);
        return () => clearInterval(id);
    }, [fetchAlerts]);

    const displayed = all.filter(a => {
        const maxSev = a.alerts.some(x => x.severity === "HIGH") ? "HIGH" : "MEDIUM";
        if (filter !== "ALL" && maxSev !== filter) return false;
        if (search && !a.machine_id.toLowerCase().includes(search.toLowerCase()) &&
            !a.machine_type.toLowerCase().includes(search.toLowerCase())) return false;
        return true;
    });

    const highCount = all.filter(a => a.alerts.some(x => x.severity === "HIGH")).length;
    const mediumCount = all.length - highCount;

    return (
        <>
            <PageMeta title="Alertes | BMI Factory" description="Journal des alertes machines." />
            <div className="space-y-5">

                {/* ── Titre ──────────────────────────────────────────────── */}
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-semibold text-gray-800 dark:text-white/90">
                            Journal des alertes
                        </h1>
                        <p className="text-sm text-gray-400 mt-0.5">
                            {lastUpdate
                                ? `Dernière actualisation : ${lastUpdate.toLocaleTimeString("fr-FR")}`
                                : "Chargement..."
                            }
                        </p>
                    </div>

                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Rechercher une machine..."
                        className="mt-2 sm:mt-0 h-9 px-3 w-full sm:w-52 rounded-md border border-gray-300 bg-white text-sm text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-200 focus:border-blue-500 transition"
                    />
                </div>

                {/* ── Compteurs ──────────────────────────────────────────── */}
                <div className="flex flex-wrap gap-2">
                    {(["ALL", "HIGH", "MEDIUM"] as const).map(f => {
                        const count = f === "ALL" ? all.length : f === "HIGH" ? highCount : mediumCount;
                        const label = f === "ALL" ? "Toutes" : f === "HIGH" ? "Critiques" : "Attentions";
                        const active = filter === f;
                        return (
                            <button
                                key={f}
                                onClick={() => setFilter(f)}
                                className={`px-3 h-8 rounded border text-sm font-medium transition ${active
                                        ? "bg-gray-800 text-white border-gray-800 dark:bg-gray-100 dark:text-gray-900 dark:border-gray-100"
                                        : "bg-white text-gray-600 border-gray-300 hover:border-gray-400 dark:bg-gray-800 dark:text-gray-300 dark:border-gray-700"
                                    }`}
                            >
                                {label} ({count})
                            </button>
                        );
                    })}
                </div>

                {/* ── Tableau ────────────────────────────────────────────── */}
                <div className="rounded-lg border border-gray-200 dark:border-gray-800 overflow-hidden">
                    {/* En-tête */}
                    <div className="grid grid-cols-[2rem_1fr_1fr_1fr_1fr_1fr_1fr_7rem] items-center gap-4 px-4 py-2.5 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
                        <span />
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Machine</span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Type</span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Causes</span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Temp.</span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Vibration</span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Huile</span>
                        <span className="text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">Horodatage</span>
                    </div>

                    {/* Corps */}
                    {loading ? (
                        <div className="flex items-center justify-center py-14 text-sm text-gray-400">
                            Chargement...
                        </div>
                    ) : displayed.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-14 gap-1 text-sm text-gray-400">
                            <span>Aucune alerte{filter !== "ALL" ? ` de niveau ${filter}` : ""}{search ? ` pour "${search}"` : ""}.</span>
                        </div>
                    ) : (
                        <div className="divide-y divide-gray-100 dark:divide-gray-800">
                            {displayed.map((alert, idx) => {
                                const isHigh = alert.alerts.some(a => a.severity === "HIGH");
                                return (
                                    <div
                                        key={idx}
                                        className="grid grid-cols-[2rem_1fr_1fr_1fr_1fr_1fr_1fr_7rem] items-center gap-4 px-4 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.02] transition"
                                    >
                                        {/* Indicateur de sévérité */}
                                        <div className="flex items-center justify-center">
                                            <span className={`block w-2 h-2 rounded-full ${isHigh ? "bg-red-500" : "bg-yellow-400"}`} />
                                        </div>

                                        {/* Machine */}
                                        <span className="text-sm font-semibold text-gray-800 dark:text-white/90 truncate">
                                            {alert.machine_id}
                                        </span>

                                        {/* Type */}
                                        <span className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                            {alert.machine_type}
                                        </span>

                                        {/* Causes */}
                                        <div className="flex flex-col gap-0.5">
                                            {alert.alerts.map((a, i) => (
                                                <span key={i} className={`text-xs ${a.severity === "HIGH" ? "text-red-600 dark:text-red-400 font-medium" : "text-yellow-600 dark:text-yellow-400"}`}>
                                                    {a.type}
                                                </span>
                                            ))}
                                        </div>

                                        {/* Température */}
                                        <span className={`text-sm tabular-nums ${alert.temperature > 75 ? "text-red-600 font-semibold dark:text-red-400" : alert.temperature > 65 ? "text-yellow-600 dark:text-yellow-400" : "text-gray-700 dark:text-gray-300"}`}>
                                            {alert.temperature} °C
                                        </span>

                                        {/* Vibration */}
                                        <span className={`text-sm tabular-nums ${alert.vibration > 6.5 ? "text-red-600 font-semibold dark:text-red-400" : alert.vibration > 5.5 ? "text-yellow-600 dark:text-yellow-400" : "text-gray-700 dark:text-gray-300"}`}>
                                            {alert.vibration} Hz
                                        </span>

                                        {/* Huile */}
                                        <span className={`text-sm tabular-nums ${alert.oil_particles > 80 ? "text-red-600 font-semibold dark:text-red-400" : alert.oil_particles > 60 ? "text-yellow-600 dark:text-yellow-400" : "text-gray-700 dark:text-gray-300"}`}>
                                            {alert.oil_particles}
                                        </span>

                                        {/* Horodatage */}
                                        <div className="text-right">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">
                                                {new Date(alert.timestamp).toLocaleDateString("fr-FR")}
                                            </p>
                                            <p className="text-xs text-gray-400">
                                                {new Date(alert.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Pied du tableau */}
                    {!loading && displayed.length > 0 && (
                        <div className="px-4 py-2.5 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900 flex items-center justify-between">
                            <span className="text-xs text-gray-400">
                                {displayed.length} résultat(s)
                            </span>
                            <span className="text-xs text-gray-400">
                                Actualisation automatique toutes les 15 s
                            </span>
                        </div>
                    )}
                </div>

            </div>
        </>
    );
}

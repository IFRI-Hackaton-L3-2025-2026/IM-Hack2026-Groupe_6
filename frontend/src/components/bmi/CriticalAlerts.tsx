import { useEffect, useState } from "react";
import { api } from "../../API/api";

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

export default function CriticalAlerts() {
    const [alerts, setAlerts] = useState<MachineAlert[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchAlerts = async () => {
        try {
            const { data } = await api.get("/alerts/");
            setAlerts(data);
        } catch (err) {
            console.error("Erreur alertes:", err);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchAlerts();
        const interval = setInterval(fetchAlerts, 15000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="rounded-2xl border border-gray-200 bg-white dark:border-gray-800 dark:bg-white/[0.03] flex flex-col overflow-hidden">
            {/* Header */}
            <div className="px-5 py-4 border-b border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/20">
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-gray-300">
                    Alertes en cours
                </h3>
            </div>

            {/* List */}
            <div className="divide-y divide-gray-100 dark:divide-gray-800 overflow-y-auto max-h-[400px]">
                {loading ? (
                    <div className="py-10 text-center text-xs text-gray-400">
                        Chargement...
                    </div>
                ) : alerts.length === 0 ? (
                    <div className="py-12 text-center">
                        <p className="text-sm text-gray-500">Aucun événement à signaler</p>
                    </div>
                ) : (
                    alerts.map((alert, index) => {
                        const isHigh = alert.alerts.some(a => a.severity === "HIGH");
                        return (
                            <div key={index} className="flex items-start gap-4 px-5 py-3 hover:bg-gray-50 dark:hover:bg-white/[0.01] transition">
                                {/* Status Indicator */}
                                <div className="mt-1.5 shrink-0">
                                    <span className={`block w-2 h-2 rounded-full ${isHigh ? "bg-red-500" : "bg-yellow-400"}`} />
                                </div>

                                {/* Content */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <p className="text-sm font-bold text-gray-800 dark:text-white/90">
                                            {alert.machine_id}
                                        </p>
                                        <time className="text-[11px] text-gray-400">
                                            {new Date(alert.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                        </time>
                                    </div>

                                    {/* Alert details */}
                                    <div className="mt-1">
                                        {alert.alerts.map((a, i) => (
                                            <p key={i} className={`text-xs ${a.severity === "HIGH" ? "text-red-600 dark:text-red-400 font-medium" : "text-gray-500 dark:text-gray-400"}`}>
                                                {a.type}
                                            </p>
                                        ))}
                                    </div>

                                    {/* Quick Numbers */}
                                    <div className="mt-2 flex gap-3 text-[10px] uppercase font-medium text-gray-400">
                                        <span>TEMP: {alert.temperature}°C</span>
                                        <span>VIB: {alert.vibration}Hz</span>
                                        <span>OIL: {alert.oil_particles}</span>
                                    </div>
                                </div>
                            </div>
                        );
                    })
                )}
            </div>

            {/* Footer */}
            {alerts.length > 0 && (
                <div className="px-5 py-2.5 bg-gray-50/30 dark:bg-gray-900/10 border-t border-gray-100 dark:border-gray-800">
                    <p className="text-[10px] text-gray-400 text-center italic">
                        Mise à jour automatique toutes les 15 secondes
                    </p>
                </div>
            )}
        </div>
    );
}

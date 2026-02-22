import { useEffect, useState, useRef, useCallback } from "react";
import PageMeta from "../components/common/PageMeta";
import { api } from "../API/api";
import flatpickr from "flatpickr";
import { CalenderIcon } from "../icons";
import {
    Table, TableBody, TableCell, TableHeader, TableRow,
} from "../components/ui/table";
import Badge from "../components/ui/badge/Badge";

const TEMP_WARNING = 65;
const TEMP_CRITICAL = 75;

function classify(temp: number): { color: "success" | "warning" | "error"; label: string } {
    if (temp > TEMP_CRITICAL) return { color: "error", label: "En Panne" };
    if (temp > TEMP_WARNING) return { color: "warning", label: "Maintenance" };
    return { color: "success", label: "Actif" };
}

export default function History() {
    const [date, setDate] = useState<string>("");
    const [machineId, setMachineId] = useState<string>("");
    const [historyData, setHistoryData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<string | null>(null);
    const [isPrediction, setIsPrediction] = useState(false);
    const datePickerRef = useRef<HTMLInputElement>(null);

    // ── Initialise flatpickr ──────────────────────────────────────────────────
    useEffect(() => {
        if (!datePickerRef.current) return;
        const fp = flatpickr(datePickerRef.current, {
            dateFormat: "Y-m-d",
            allowInput: true,
            onChange: (selectedDates) => {
                if (selectedDates.length > 0) {
                    const d = selectedDates[0].toISOString().split("T")[0];
                    setDate(d);
                }
            },
            onClear: () => setDate(""),
        });
        return () => fp.destroy();
    }, []);

    // ── Fetch data ────────────────────────────────────────────────────────────
    const fetchHistory = useCallback(async () => {
        setLoading(true);
        setHistoryData([]);
        setMessage(null);
        setIsPrediction(false);
        try {
            let url = "/factory/history";
            const params: string[] = [];
            if (date) params.push(`date=${date}`);
            if (machineId.trim()) params.push(`machine_id=${machineId.trim()}`);
            if (params.length) url += "?" + params.join("&");

            const { data } = await api.get(url);

            if (Array.isArray(data)) {
                setHistoryData(data);
            } else if (data && typeof data === "object") {
                if (data.type_donnees?.includes("Prédiction")) {
                    const normalized = {
                        timestamp: date + "T00:00:00",
                        machine_id: data.equipement?.split("ID: ")[1] || machineId,
                        machine_type: data.equipement?.split(" ")[0] || "—",
                        temperature: parseFloat(data.temperature_estimee) || 0,
                        vibration: parseFloat(data.vibration_estimee) || 0,
                        current_mean: parseFloat(data.courant_estime) || 0,
                        oil_particles: null,
                        failure_next_24h: data.statut_estime === "Risque élevé" ? 1 : 0,
                        statut: data.statut_estime,
                        isPrediction: true,
                        confidence: data.niveau_confiance,
                    };
                    setHistoryData([normalized]);
                    setMessage(data.message);
                    setIsPrediction(true);
                } else if (data.message) {
                    setMessage(data.message);
                }
            }
        } catch {
            setMessage("Erreur de communication avec le serveur.");
        } finally {
            setLoading(false);
        }
    }, [date, machineId]);

    // Load global view on mount, and re-fetch when filters change
    useEffect(() => {
        fetchHistory();
    }, [fetchHistory]);

    const isFiltered = !!date || !!machineId.trim();

    return (
        <>
            <PageMeta
                title="Historique | BMI Factory"
                description="Exploration des données historiques de l'usine."
            />
            <div className="space-y-6">

                {/* ── Header ─────────────────────────────────────────────────── */}
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">
                            Archives & Prédictions
                        </h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            {isFiltered
                                ? `Filtré : ${machineId || "toutes les machines"} · ${date || "toutes les dates"}`
                                : "Vue globale — dernier état de chaque machine"}
                        </p>
                    </div>

                    {/* ── Search Controls ──────────────────────────────────── */}
                    <div className="flex flex-wrap items-center gap-3">
                        {/* Machine ID */}
                        <input
                            type="text"
                            value={machineId}
                            onChange={(e) => setMachineId(e.target.value)}
                            className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 w-52 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition"
                            placeholder="Machine ID (ex: KUKA_10)"
                        />

                        {/* Date Picker */}
                        <div className="relative inline-flex items-center">
                            <CalenderIcon className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-gray-400 pointer-events-none z-10" />
                            <input
                                ref={datePickerRef}
                                className="h-10 pl-9 pr-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-700 outline-none dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 cursor-pointer focus:border-brand-500 transition"
                                placeholder="Filtrer par date"
                            />
                        </div>

                        {/* Reset button (only visible when filters active) */}
                        {isFiltered && (
                            <button
                                onClick={() => {
                                    setMachineId("");
                                    setDate("");
                                    if (datePickerRef.current) {
                                        // Clear flatpickr
                                        (datePickerRef.current as any)._flatpickr?.clear();
                                    }
                                }}
                                className="h-10 px-4 rounded-lg border border-gray-200 bg-white text-sm font-medium text-gray-500 hover:text-brand-500 hover:border-brand-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 transition"
                            >
                                ✕ Réinitialiser
                            </button>
                        )}
                    </div>
                </div>

                {/* ── Prediction banner ───────────────────────────────────────── */}
                {isPrediction && message && (
                    <div className="flex items-start gap-3 p-4 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700 rounded-xl">
                        <span className="text-lg shrink-0">⚠️</span>
                        <p className="text-sm text-amber-800 dark:text-amber-300">{message}</p>
                    </div>
                )}

                {/* ── Hint for future dates ───────────────────────────────────── */}
                {!isPrediction && message?.includes("machine_id") && (
                    <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-700 rounded-xl">
                        <span className="text-lg shrink-0">💡</span>
                        <p className="text-sm text-blue-700 dark:text-blue-300">
                            Date future détectée. Saisissez un ID de machine (ex:{" "}
                            <code className="bg-blue-100 dark:bg-blue-800 px-1 rounded">KUKA_10</code>)
                            {" "}pour obtenir une prédiction.
                        </p>
                    </div>
                )}

                {/* ── Table Card ─────────────────────────────────────────────── */}
                <div className="rounded-2xl border border-gray-200 bg-white dark:bg-white/[0.03] dark:border-gray-800 overflow-hidden">
                    {loading ? (
                        <div className="flex items-center justify-center py-20 gap-3">
                            <div className="w-6 h-6 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
                            <p className="text-gray-500 dark:text-gray-400">Chargement de l'historique...</p>
                        </div>
                    ) : historyData.length > 0 ? (
                        <div className="max-w-full overflow-x-auto">
                            <Table>
                                <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                                    <TableRow>
                                        {["Machine", "Type", "Horodatage", "Temp. (°C)", "Vibration (Hz)", "Courant (A)", "Particules", "Risque 24h", "Statut"].map((h) => (
                                            <TableCell key={h} isHeader className="py-3 px-4 font-semibold text-gray-500 text-start text-theme-xs dark:text-gray-400 whitespace-nowrap">
                                                {h}
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                </TableHeader>
                                <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                                    {historyData.map((row, idx) => {
                                        const status = classify(row.temperature);
                                        return (
                                            <TableRow key={idx} className={row.isPrediction ? "bg-amber-50/40 dark:bg-amber-900/5" : "hover:bg-gray-50/50 dark:hover:bg-white/[0.02] transition"}>
                                                {/* Machine */}
                                                <TableCell className="py-3 px-4 font-bold text-theme-sm text-gray-800 dark:text-white/90 whitespace-nowrap">
                                                    {row.machine_id}
                                                    {row.isPrediction && (
                                                        <span className="ml-2 text-[9px] font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider bg-amber-100 dark:bg-amber-900/30 px-1 py-0.5 rounded">
                                                            Prédit
                                                        </span>
                                                    )}
                                                </TableCell>
                                                {/* Type */}
                                                <TableCell className="py-3 px-4 text-theme-sm text-gray-500 dark:text-gray-400">
                                                    {row.machine_type || "—"}
                                                </TableCell>
                                                {/* Timestamp */}
                                                <TableCell className="py-3 px-4 text-theme-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
                                                    <div className="flex flex-col">
                                                        <span>{new Date(row.timestamp).toLocaleDateString("fr-FR")}</span>
                                                        {!row.isPrediction && (
                                                            <span className="text-[10px] text-gray-400">
                                                                {new Date(row.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                {/* Temperature */}
                                                <TableCell className="py-3 px-4 text-theme-sm font-semibold whitespace-nowrap">
                                                    <span className={
                                                        row.temperature > TEMP_CRITICAL ? "text-red-600" :
                                                            row.temperature > TEMP_WARNING ? "text-yellow-600" :
                                                                "text-green-600"
                                                    }>
                                                        {row.temperature?.toFixed(1) ?? "—"} °C
                                                    </span>
                                                </TableCell>
                                                {/* Vibration */}
                                                <TableCell className="py-3 px-4 text-theme-sm text-gray-600 dark:text-gray-300">
                                                    {row.vibration?.toFixed(2) ?? "—"}
                                                </TableCell>
                                                {/* Current */}
                                                <TableCell className="py-3 px-4 text-theme-sm text-gray-600 dark:text-gray-300">
                                                    {row.current_mean?.toFixed(1) ?? "—"}
                                                </TableCell>
                                                {/* Oil */}
                                                <TableCell className="py-3 px-4 text-theme-sm text-gray-600 dark:text-gray-300">
                                                    {row.oil_particles != null ? row.oil_particles.toFixed(1) : "—"}
                                                </TableCell>
                                                {/* Risk */}
                                                <TableCell className="py-3 px-4">
                                                    {row.failure_next_24h != null ? (
                                                        <Badge size="sm" color={row.failure_next_24h === 1 ? "error" : "success"}>
                                                            {row.failure_next_24h === 1 ? "⚠ Panne" : "✓ OK"}
                                                        </Badge>
                                                    ) : <span className="text-gray-400 text-sm">—</span>}
                                                </TableCell>
                                                {/* Status */}
                                                <TableCell className="py-3 px-4">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <Badge size="sm" color={row.statut ? classify(row.temperature).color : status.color}>
                                                            {row.statut || status.label}
                                                        </Badge>
                                                        {row.isPrediction && row.confidence && (
                                                            <span className="text-[10px] text-gray-400 italic">
                                                                Confiance: {row.confidence}
                                                            </span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        );
                                    })}
                                </TableBody>
                            </Table>
                        </div>
                    ) : (
                        <div className="py-20 text-center">
                            <p className="text-gray-400 dark:text-gray-500">
                                {message || "Aucune donnée disponible."}
                            </p>
                            {machineId && (
                                <p className="mt-2 text-sm text-gray-400">
                                    Vérifiez que l'identifiant de machine est correct.
                                </p>
                            )}
                        </div>
                    )}
                </div>

                {/* ── Footer count ───────────────────────────────────────────── */}
                {historyData.length > 0 && (
                    <p className="text-xs text-gray-400 dark:text-gray-600 text-right">
                        {historyData.length} machine(s) · {isFiltered ? "Résultat filtré" : "Vue globale — dernier état connu"}
                    </p>
                )}

            </div>
        </>
    );
}

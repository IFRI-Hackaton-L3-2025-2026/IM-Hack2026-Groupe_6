import { useEffect, useState } from "react";
import { api } from "../../API/api";
import {
    Table,
    TableBody,
    TableCell,
    TableHeader,
    TableRow,
} from "../ui/table";
import Badge from "../ui/badge/Badge";
import ImmersiveModal from "../ui/modal/ImmersiveModal";
import Machine3DView from "./Machine3DView";

// ─── Types ────────────────────────────────────────────────────────────────────

interface MachineData {
    machine_id: string;
    machine_type: string;
    timestamp: string;
    temperature: number;
    vibration: number;
    current: number;
}

type StatusType = 'active' | 'maintenance' | 'failure';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getStatusType(temp: number): StatusType {
    if (temp > 75) return 'failure';
    if (temp > 65) return 'maintenance';
    return 'active';
}

function getStatusColor(temp: number): 'error' | 'warning' | 'success' {
    if (temp > 75) return 'error';
    if (temp > 65) return 'warning';
    return 'success';
}

function getStatusText(temp: number) {
    if (temp > 75) return 'En Panne';
    if (temp > 65) return 'Maintenance';
    return 'Actif';
}

// ─── Skeleton row ─────────────────────────────────────────────────────────────

function SkeletonRow() {
    return (
        <TableRow>
            {[1, 2, 3, 4, 5, 6].map((i) => (
                <TableCell key={i} className="py-3">
                    <div className="h-4 bg-gray-100 dark:bg-gray-800 rounded animate-pulse" />
                </TableCell>
            ))}
        </TableRow>
    );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function MachineStatusTable() {
    const [machines, setMachines] = useState<MachineData[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedMachine, setSelectedMachine] = useState<MachineData | null>(null);

    useEffect(() => {
        const fetchMachines = async () => {
            try {
                const response = await api.get("/machines/");
                const latest: Record<string, MachineData> = {};
                response.data.forEach((m: MachineData) => { latest[m.machine_id] = m; });
                setMachines(Object.values(latest));
            } catch (err) {
                console.error("Erreur chargement machines:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchMachines();
        const id = setInterval(fetchMachines, 5000);
        return () => clearInterval(id);
    }, []);

    return (
        <>
            {/* ── Table card ──────────────────────────────────────────────── */}
            <div className="overflow-hidden rounded-2xl bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 shadow-theme-sm">

                {/* Header */}
                <div className="px-6 pt-5 pb-4 border-b border-gray-100 dark:border-gray-800">
                    <h3 className="text-base font-semibold text-gray-800 dark:text-white/90">
                        Statut des Équipements
                    </h3>
                    <p className="mt-0.5 text-sm text-gray-500 dark:text-gray-400">
                        Mise à jour en temps réel · BMI Factory
                    </p>
                </div>

                {/* Table */}
                <div className="max-w-full overflow-x-auto">
                    <Table>
                        <TableHeader className="border-b border-gray-100 dark:border-gray-800">
                            <TableRow>
                                {['Machine ID', 'Type', 'Température', 'Vibration', 'Statut', 'Action'].map((h, i) => (
                                    <TableCell
                                        key={h}
                                        isHeader
                                        className={`py-3 px-4 font-medium text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider ${i === 5 ? 'text-right' : 'text-left'}`}
                                    >
                                        {h}
                                    </TableCell>
                                ))}
                            </TableRow>
                        </TableHeader>

                        <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                            {loading
                                ? Array.from({ length: 4 }).map((_, i) => <SkeletonRow key={i} />)
                                : machines.map((machine) => {
                                    const hot = machine.temperature > 75;
                                    const warm = machine.temperature > 65;

                                    return (
                                        <TableRow
                                            key={machine.machine_id}
                                            className="hover:bg-gray-50 dark:hover:bg-white/[0.02] transition-colors"
                                        >
                                            {/* ID */}
                                            <TableCell className="py-3 px-4">
                                                <span className="font-mono text-sm font-medium text-gray-800 dark:text-white/90">
                                                    {machine.machine_id}
                                                </span>
                                            </TableCell>

                                            {/* Type */}
                                            <TableCell className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300">
                                                {machine.machine_type}
                                            </TableCell>

                                            {/* Temperature */}
                                            <TableCell className="py-3 px-4">
                                                <span className={`text-sm font-medium tabular-nums ${hot ? 'text-error-600 dark:text-error-400' :
                                                    warm ? 'text-warning-600 dark:text-warning-400' :
                                                        'text-gray-600 dark:text-gray-300'
                                                    }`}>
                                                    {machine.temperature.toFixed(1)} °C
                                                </span>
                                            </TableCell>

                                            {/* Vibration */}
                                            <TableCell className="py-3 px-4 text-sm text-gray-600 dark:text-gray-300 tabular-nums">
                                                {machine.vibration.toFixed(2)} Hz
                                            </TableCell>

                                            {/* Status badge */}
                                            <TableCell className="py-3 px-4">
                                                <Badge size="sm" color={getStatusColor(machine.temperature)}>
                                                    {getStatusText(machine.temperature)}
                                                </Badge>
                                            </TableCell>

                                            {/* CTA — "Voir en 3D" */}
                                            <TableCell className="py-3 px-4 text-right">
                                                <button
                                                    id={`btn-3d-${machine.machine_id}`}
                                                    onClick={() => setSelectedMachine(machine)}
                                                    className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-semibold text-white bg-brand-500 hover:bg-brand-600 shadow-theme-xs transition-all duration-150 hover:shadow-md active:scale-[0.97]"
                                                >
                                                    {/* cube icon */}
                                                    <svg
                                                        width="13" height="13"
                                                        viewBox="0 0 24 24"
                                                        fill="none"
                                                        stroke="currentColor"
                                                        strokeWidth="2.2"
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        className="shrink-0"
                                                    >
                                                        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
                                                        <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
                                                        <line x1="12" y1="22.08" x2="12" y2="12" />
                                                    </svg>
                                                    Voir en 3D
                                                </button>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })
                            }
                        </TableBody>
                    </Table>
                </div>
            </div>

            {/* ── Immersive 3D modal ───────────────────────────────────────── */}
            <ImmersiveModal
                isOpen={!!selectedMachine}
                onClose={() => setSelectedMachine(null)}
                title={selectedMachine?.machine_id ?? '—'}
                machineType={selectedMachine?.machine_type}
                telemetry={selectedMachine ? {
                    temperature: selectedMachine.temperature,
                    vibration: selectedMachine.vibration,
                    current: selectedMachine.current,
                    status: getStatusType(selectedMachine.temperature),
                } : undefined}
            >
                {selectedMachine && (
                    <Machine3DView
                        machineId={selectedMachine.machine_id}
                        type={selectedMachine.machine_type}
                        status={getStatusType(selectedMachine.temperature)}
                        temperature={selectedMachine.temperature}
                        vibration={selectedMachine.vibration}
                    />
                )}
            </ImmersiveModal>
        </>
    );
}

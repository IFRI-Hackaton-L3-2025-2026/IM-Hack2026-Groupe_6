import { ReactNode, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Thermometer, Zap, Activity, Cpu } from "lucide-react";

// ─── Types ──────────────────────────────────────────────────────────────────

export interface TelemetryData {
    temperature?: number;
    vibration?: number;
    current?: number;
    status?: 'active' | 'maintenance' | 'failure';
}

interface ImmersiveModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children: ReactNode;
    telemetry?: TelemetryData;
    machineType?: string;
}

// ─── Status config ──────────────────────────────────────────────────────────

const STATUS_CONFIG = {
    active: { label: 'Opérationnel', badgeClass: 'bg-success-50 text-success-600 dark:bg-success-500/10 dark:text-success-400', dotClass: 'bg-success-500' },
    maintenance: { label: 'Maintenance', badgeClass: 'bg-warning-50 text-warning-600 dark:bg-warning-500/10 dark:text-warning-400', dotClass: 'bg-warning-400' },
    failure: { label: 'En panne', badgeClass: 'bg-error-50 text-error-600 dark:bg-error-500/10 dark:text-error-400', dotClass: 'bg-error-500' },
};

// ─── Metric bar ─────────────────────────────────────────────────────────────

interface MetricBarProps {
    label: string;
    value: number;
    unit: string;
    max: number;
    Icon: React.ElementType;
    variant?: 'default' | 'warning' | 'danger';
}

function MetricBar({ label, value, unit, max, Icon, variant = 'default' }: MetricBarProps) {
    const pct = Math.min(100, (value / max) * 100);
    const fillClass = { default: 'bg-brand-500', warning: 'bg-warning-400', danger: 'bg-error-500' }[variant];
    const iconColor = { default: 'text-brand-500', warning: 'text-warning-500', danger: 'text-error-500' }[variant];

    return (
        <div className="flex flex-col gap-1">
            <div className="flex items-center justify-between">
                <div className={`flex items-center gap-1.5 ${iconColor}`}>
                    <Icon size={11} />
                    <span className="text-[11px] font-medium text-gray-600 dark:text-gray-400">{label}</span>
                </div>
                <span className={`text-[11px] font-semibold tabular-nums ${iconColor}`}>
                    {value.toFixed(1)} {unit}
                </span>
            </div>
            <div className="h-1 w-full rounded-full bg-gray-100 dark:bg-gray-800 overflow-hidden">
                <motion.div
                    className={`h-full rounded-full ${fillClass}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
                />
            </div>
        </div>
    );
}

// ─── Main component ─────────────────────────────────────────────────────────

export default function ImmersiveModal({
    isOpen,
    onClose,
    title,
    children,
    telemetry,
    machineType,
}: ImmersiveModalProps) {
    const status = telemetry?.status ?? 'active';
    const cfg = STATUS_CONFIG[status];

    // Body scroll lock
    useEffect(() => {
        document.body.style.overflow = isOpen ? 'hidden' : 'unset';
        return () => { document.body.style.overflow = 'unset'; };
    }, [isOpen]);

    // ESC key
    const onKey = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Escape') onClose();
    }, [onClose]);
    useEffect(() => {
        window.addEventListener('keydown', onKey);
        return () => window.removeEventListener('keydown', onKey);
    }, [onKey]);

    const tempVariant = (): MetricBarProps['variant'] => {
        const t = telemetry?.temperature ?? 0;
        if (t > 75) return 'danger';
        if (t > 60) return 'warning';
        return 'default';
    };

    const hasTelemetry = !!(
        telemetry?.temperature !== undefined ||
        telemetry?.vibration !== undefined ||
        telemetry?.current !== undefined
    );

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    {/* ── Full-screen dark overlay — covers navbar and everything ── */}
                    <motion.div
                        key="overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.25 }}
                        className="fixed inset-0 z-[99998] bg-black/60 backdrop-blur-sm"
                        onClick={onClose}
                    />

                    {/* ── Full-screen modal panel ── */}
                    <motion.div
                        key="modal"
                        initial={{ opacity: 0, scale: 0.97 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.97 }}
                        transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                        className="fixed inset-0 z-[99999] flex flex-col bg-white dark:bg-gray-900"
                    >
                        {/* ── Header bar (compact) ── */}
                        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 flex-shrink-0">
                            <div className="flex items-center gap-3 min-w-0">
                                {/* Status badge */}
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold flex-shrink-0 ${cfg.badgeClass}`}>
                                    <span className={`w-1.5 h-1.5 rounded-full ${cfg.dotClass} ${status === 'active' ? 'animate-pulse' : ''}`} />
                                    {cfg.label}
                                </span>
                                <div className="min-w-0">
                                    <h2 className="text-sm font-semibold text-gray-800 dark:text-white/90 truncate">
                                        {title}
                                    </h2>
                                    {machineType && (
                                        <p className="text-xs text-gray-500 dark:text-gray-400 truncate mt-0.5">
                                            {machineType} · Digital Twin
                                        </p>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={onClose}
                                className="ml-4 flex-shrink-0 flex h-9 w-9 items-center justify-center rounded-full bg-gray-100 text-gray-500 transition hover:bg-gray-200 hover:text-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white"
                            >
                                <X size={16} />
                            </button>
                        </div>

                        {/* ── Body — 3D takes up most space ── */}
                        <div className="flex flex-1 min-h-0 overflow-hidden">

                            {/* 3D viewer — takes all remaining space */}
                            <div className="flex-1 min-w-0 min-h-0">
                                {children}
                            </div>

                            {/* Telemetry sidebar — narrow, only if data available */}
                            {hasTelemetry && (
                                <motion.aside
                                    initial={{ opacity: 0, x: 16 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: 0.15, duration: 0.25 }}
                                    className="w-52 flex-shrink-0 flex flex-col gap-4 p-4 overflow-y-auto border-l border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/60"
                                >
                                    {/* Telemetry */}
                                    <div>
                                        <h3 className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5">
                                            Télémétrie
                                        </h3>
                                        <div className="flex flex-col gap-3.5">
                                            {telemetry?.temperature !== undefined && (
                                                <MetricBar label="Température" value={telemetry.temperature} unit="°C" max={100} Icon={Thermometer} variant={tempVariant()} />
                                            )}
                                            {telemetry?.vibration !== undefined && (
                                                <MetricBar label="Vibration" value={telemetry.vibration} unit="Hz" max={10} Icon={Activity} />
                                            )}
                                            {telemetry?.current !== undefined && (
                                                <MetricBar label="Intensité" value={telemetry.current} unit="A" max={50} Icon={Zap} />
                                            )}
                                        </div>
                                    </div>

                                    <hr className="border-gray-100 dark:border-gray-800" />

                                    {/* System info */}
                                    <div>
                                        <h3 className="text-[10px] font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2.5 flex items-center gap-1.5">
                                            <Cpu size={10} />
                                            Système
                                        </h3>
                                        <dl className="flex flex-col gap-1.5">
                                            {[
                                                { k: 'Moteur', v: 'Three.js' },
                                                { k: 'Rendu', v: 'WebGL PBR' },
                                                { k: 'Sync', v: '~5 s' },
                                            ].map(({ k, v }) => (
                                                <div key={k} className="flex justify-between items-center">
                                                    <dt className="text-[11px] text-gray-400 dark:text-gray-500">{k}</dt>
                                                    <dd className="text-[11px] font-medium text-gray-700 dark:text-gray-300">{v}</dd>
                                                </div>
                                            ))}
                                        </dl>
                                    </div>
                                </motion.aside>
                            )}
                        </div>

                        {/* ── Footer (minimal) ── */}
                        <div className="px-5 py-2 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between flex-shrink-0 bg-gray-50 dark:bg-gray-900/40">
                            <p className="text-[11px] text-gray-400 dark:text-gray-500">
                                Glisser pour pivoter · Roulette pour zoomer · <kbd className="px-1 py-0.5 bg-gray-100 dark:bg-gray-800 rounded text-[10px] font-mono">ESC</kbd> pour fermer
                            </p>
                            <button
                                onClick={onClose}
                                className="text-xs font-semibold text-brand-500 hover:text-brand-600 transition-colors"
                            >
                                Fermer
                            </button>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}

import { useEffect, useState } from "react";
import { api } from "../../API/api";
import { BoxIconLine, GroupIcon, BoxCubeIcon } from "../../icons";
import Badge from "../ui/badge/Badge";

interface KPIs {
    total_machines: number;
    active: number;
    maintenance: number;
    failure: number;
    average_temperature: number;
    most_critical_machine: string;
}

export default function FactoryMetrics() {
    const [kpis, setKpis] = useState<KPIs | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchKPIs = async () => {
            try {
                const response = await api.get("/factory/kpis");
                setKpis(response.data);
            } catch (error) {
                console.error("Error fetching KPIs:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchKPIs();
        const interval = setInterval(fetchKPIs, 5000); // Update every 5 seconds
        return () => clearInterval(interval);
    }, []);

    if (loading) return <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 md:gap-6">Loading metrics...</div>;
    if (!kpis) return null;

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4 h-24">
            {/* Total Machines */}
            <div className="rounded-xl glass-card px-4 py-2 flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-blue-100 rounded-lg dark:bg-blue-900/20 shrink-0">
                    <BoxCubeIcon className="text-blue-600 size-5 dark:text-blue-400" />
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Total</p>
                    <p className="text-xl font-bold text-gray-800 dark:text-white/90 leading-tight">{kpis.total_machines}</p>
                </div>
            </div>

            {/* Active */}
            <div className="rounded-xl glass-card px-4 py-2 flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-green-100 rounded-lg dark:bg-green-900/20 shrink-0">
                    <GroupIcon className="text-green-600 size-5 dark:text-green-400" />
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Actives</p>
                    <div className="flex items-center gap-2">
                        <p className="text-xl font-bold text-gray-800 dark:text-white/90 leading-tight">{kpis.active}</p>
                        <div className="h-1.5 w-1.5 rounded-full bg-green-500 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Maintenance */}
            <div className="rounded-xl glass-card px-4 py-2 flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-yellow-100 rounded-lg dark:bg-yellow-900/20 shrink-0">
                    <BoxIconLine className="text-yellow-600 size-5 dark:text-yellow-400" />
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Maintenance</p>
                    <div className="flex items-center gap-2">
                        <p className="text-xl font-bold text-gray-800 dark:text-white/90 leading-tight">{kpis.maintenance}</p>
                        <div className="h-1.5 w-1.5 rounded-full bg-yellow-500 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Failure */}
            <div className="rounded-xl glass-card px-4 py-2 flex items-center gap-4">
                <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg dark:bg-red-900/20 shrink-0">
                    <BoxIconLine className="text-red-600 size-5 dark:text-red-400" />
                </div>
                <div>
                    <p className="text-[10px] uppercase tracking-wider font-semibold text-gray-500 dark:text-gray-400">Pannes</p>
                    <div className="flex items-center gap-2">
                        <p className="text-xl font-bold text-gray-800 dark:text-white/90 leading-tight">{kpis.failure}</p>
                        <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" />
                    </div>
                </div>
            </div>
        </div>
    );
}

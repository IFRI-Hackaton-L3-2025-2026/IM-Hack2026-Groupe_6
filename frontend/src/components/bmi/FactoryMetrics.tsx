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
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 md:gap-4">
            {/* Total Machines */}
            <div className="rounded-xl glass-card p-4">
                <div className="flex items-center justify-center w-9 h-9 bg-blue-100 rounded-lg dark:bg-blue-900/20">
                    <BoxCubeIcon className="text-blue-600 size-4 dark:text-blue-400" />
                </div>
                <div className="mt-3">
                    <p className="text-xs text-gray-500 dark:text-gray-400">Total Machines</p>
                    <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">{kpis.total_machines}</p>
                </div>
            </div>

            {/* Active */}
            <div className="rounded-xl glass-card p-4">
                <div className="flex items-center justify-center w-9 h-9 bg-green-100 rounded-lg dark:bg-green-900/20">
                    <GroupIcon className="text-green-600 size-4 dark:text-green-400" />
                </div>
                <div className="mt-3 flex items-end justify-between">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Machines Actives</p>
                        <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">{kpis.active}</p>
                    </div>
                    <Badge color="success" size="sm">Opérationnel</Badge>
                </div>
            </div>

            {/* Maintenance */}
            <div className="rounded-xl glass-card p-4">
                <div className="flex items-center justify-center w-9 h-9 bg-yellow-100 rounded-lg dark:bg-yellow-900/20">
                    <BoxIconLine className="text-yellow-600 size-4 dark:text-yellow-400" />
                </div>
                <div className="mt-3 flex items-end justify-between">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">En Maintenance</p>
                        <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">{kpis.maintenance}</p>
                    </div>
                    <Badge color="warning" size="sm">Attention</Badge>
                </div>
            </div>

            {/* Failure */}
            <div className="rounded-xl glass-card p-4">
                <div className="flex items-center justify-center w-9 h-9 bg-red-100 rounded-lg dark:bg-red-900/20">
                    <BoxIconLine className="text-red-600 size-4 dark:text-red-400" />
                </div>
                <div className="mt-3 flex items-end justify-between">
                    <div>
                        <p className="text-xs text-gray-500 dark:text-gray-400">En Panne</p>
                        <p className="mt-1 text-2xl font-bold text-gray-800 dark:text-white/90">{kpis.failure}</p>
                    </div>
                    <Badge color="error" size="sm">Critique</Badge>
                </div>
            </div>
        </div>
    );
}

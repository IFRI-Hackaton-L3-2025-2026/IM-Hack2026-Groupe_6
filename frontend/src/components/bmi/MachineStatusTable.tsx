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

interface MachineData {
    machine_id: string;
    machine_type: string;
    timestamp: string;
    temperature: number;
    vibration: number;
    current: number;
}

export default function MachineStatusTable() {
    const [machines, setMachines] = useState<MachineData[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchMachines = async () => {
            try {
                const response = await api.get("/machines/");
                // We get the last 100 records, let's group by machine_id and take the latest
                const latestMachines: Record<string, MachineData> = {};
                response.data.forEach((m: MachineData) => {
                    latestMachines[m.machine_id] = m;
                });
                setMachines(Object.values(latestMachines));
            } catch (error) {
                console.error("Error fetching machines:", error);
            } finally {
                setLoading(false);
            }
        };

        fetchMachines();
        const interval = setInterval(fetchMachines, 5000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (temp: number) => {
        if (temp > 75) return "error";
        if (temp > 65) return "warning";
        return "success";
    };

    const getStatusText = (temp: number) => {
        if (temp > 75) return "En Panne";
        if (temp > 65) return "Maintenance";
        return "Actif";
    };

    if (loading) return <div>Chargement de la liste des équipements...</div>;

    return (
        <div className="overflow-hidden rounded-2xl glass-card px-4 pb-3 pt-4 sm:px-6">
            <div className="flex flex-col gap-2 mb-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-white/90">
                        Statut des Équipements
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                        Mise à jour en temps réel (BMI Factory)
                    </p>
                </div>
            </div>
            <div className="max-w-full overflow-x-auto">
                <Table>
                    <TableHeader className="border-gray-100 dark:border-gray-800 border-y">
                        <TableRow>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Machine ID
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Type
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Température
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Vibration
                            </TableCell>
                            <TableCell isHeader className="py-3 font-medium text-gray-500 text-start text-theme-xs dark:text-gray-400">
                                Statut
                            </TableCell>
                        </TableRow>
                    </TableHeader>

                    <TableBody className="divide-y divide-gray-100 dark:divide-gray-800">
                        {machines.map((machine) => (
                            <TableRow key={machine.machine_id}>
                                <TableCell className="py-3">
                                    <p className="font-medium text-gray-800 text-theme-sm dark:text-white/90">
                                        {machine.machine_id}
                                    </p>
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {machine.machine_type}
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {machine.temperature.toFixed(2)} °C
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    {machine.vibration.toFixed(2)} Hz
                                </TableCell>
                                <TableCell className="py-3 text-gray-500 text-theme-sm dark:text-gray-400">
                                    <Badge
                                        size="sm"
                                        color={getStatusColor(machine.temperature)}
                                    >
                                        {getStatusText(machine.temperature)}
                                    </Badge>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>
        </div>
    );
}

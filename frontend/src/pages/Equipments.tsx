import { useState } from "react";
import PageMeta from "../components/common/PageMeta";
import MachineStatusTable from "../components/bmi/MachineStatusTable";
import TelemetryChart from "../components/bmi/TelemetryChart";

export default function Equipments() {
    const [selectedMachine, setSelectedMachine] = useState<string | null>(null);

    return (
        <>
            <PageMeta
                title="Équipements | BMI Factory"
                description="Gestion et détails des équipements de l'usine."
            />
            <div className="space-y-6">
                <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Parc Machine BMI</h1>
                <p className="text-gray-500">Consultez l'état de santé de chaque unité en temps réel.</p>

                <div className="grid grid-cols-12 gap-6">
                    <div className="col-span-12" onClick={() => setSelectedMachine("M1-KUKA")}>
                        <MachineStatusTable />
                    </div>

                    {selectedMachine && (
                        <div className="col-span-12">
                            <div className="p-6 bg-white border border-gray-200 rounded-2xl dark:bg-white/[0.03] dark:border-gray-800">
                                <h2 className="mb-4 text-xl font-bold text-gray-800 dark:text-white/90">Détails de Simulation: {selectedMachine}</h2>
                                <TelemetryChart />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </>
    );
}

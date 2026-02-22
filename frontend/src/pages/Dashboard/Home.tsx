import PageMeta from "../../components/common/PageMeta";
import FactoryMetrics from "../../components/bmi/FactoryMetrics";
import TelemetryChart from "../../components/bmi/TelemetryChart";
import MachineStatusTable from "../../components/bmi/MachineStatusTable";
import CriticalAlerts from "../../components/bmi/CriticalAlerts";

export default function Home() {
  return (
    <>
      <PageMeta
        title="BMI Factory | Predictive Maintenance Dashboard"
        description="Système de surveillance en temps réel pour l'usine Benin Moto Industry (BMI)."
      />
      <div className="space-y-6">
        {/* Top KPIs */}
        <FactoryMetrics />

        <div className="grid grid-cols-12 gap-4 md:gap-6">
          {/* Main Chart */}
          <div className="col-span-12 xl:col-span-8">
            <TelemetryChart />
          </div>

          {/* Recent Alerts */}
          <div className="col-span-12 xl:col-span-4">
            <CriticalAlerts />
          </div>

          {/* Machine List */}
          <div className="col-span-12">
            <MachineStatusTable />
          </div>
        </div>
      </div>
    </>
  );
}

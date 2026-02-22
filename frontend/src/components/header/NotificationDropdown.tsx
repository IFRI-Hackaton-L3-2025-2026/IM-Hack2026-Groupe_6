import { useState, useEffect } from "react";
import { Dropdown } from "../ui/dropdown/Dropdown";
import { DropdownItem } from "../ui/dropdown/DropdownItem";
import { Link } from "react-router";
import { api } from "../../API/api";

interface RawMachineAlert {
  machine_id: string;
  machine_type: string;
  alerts: { type: string; severity: string }[];
  temperature: number;
  vibration: number;
  oil_particles: number;
  timestamp: string;
}

interface AlertUI {
  machine_id: string;
  type: string;
  severity: string;
  currentValue: number;
  unit: string;
  timestamp: string;
}

export default function NotificationDropdown() {
  const [isOpen, setIsOpen] = useState(false);
  const [uiAlerts, setUiAlerts] = useState<AlertUI[]>([]);
  const [hasNewHighAlert, setHasNewHighAlert] = useState(false);

  const fetchAlerts = async () => {
    try {
      const { data } = await api.get("/alerts/");
      if (Array.isArray(data)) {
        const rawItems = data as RawMachineAlert[];

        // Flatten alerts for UI
        const flattened: AlertUI[] = [];
        rawItems.forEach(machine => {
          machine.alerts.forEach(alert => {
            let val = 0;
            let unit = "";
            if (alert.type.includes("TEMPÉRATURE")) {
              val = machine.temperature;
              unit = "°C";
            } else if (alert.type.includes("VIBRATION")) {
              val = machine.vibration;
              unit = "Hz";
            } else if (alert.type.includes("HUILE")) {
              val = machine.oil_particles;
              unit = "pts";
            }

            flattened.push({
              machine_id: machine.machine_id,
              type: alert.type,
              severity: alert.severity,
              currentValue: val,
              unit,
              timestamp: machine.timestamp
            });
          });
        });

        setUiAlerts(flattened.slice(0, 10));
        setHasNewHighAlert(flattened.some(a => a.severity === "HIGH"));
      }
    } catch (error) {
      console.error("Failed to fetch notification alerts", error);
    }
  };

  useEffect(() => {
    fetchAlerts();
    const interval = setInterval(fetchAlerts, 30000);
    return () => clearInterval(interval);
  }, []);

  function toggleDropdown() {
    setIsOpen(!isOpen);
    if (!isOpen) {
      setHasNewHighAlert(false);
    }
  }

  function closeDropdown() {
    setIsOpen(false);
  }

  return (
    <div className="relative">
      <button
        className="relative flex items-center justify-center text-gray-500 transition-colors bg-white border border-gray-200 rounded-full dropdown-toggle hover:text-gray-700 h-11 w-11 hover:bg-gray-100 dark:border-gray-800 dark:bg-gray-900 dark:text-gray-400 dark:hover:bg-gray-800 dark:hover:text-white"
        onClick={toggleDropdown}
      >
        {hasNewHighAlert && (
          <span className="absolute right-0 top-0.5 z-10 h-2 w-2 rounded-full bg-red-500">
            <span className="absolute inline-flex w-full h-full bg-red-500 rounded-full opacity-75 animate-ping"></span>
          </span>
        )}
        <svg
          className="fill-current"
          width="20"
          height="20"
          viewBox="0 0 20 20"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M10.75 2.29248C10.75 1.87827 10.4143 1.54248 10 1.54248C9.58583 1.54248 9.25004 1.87827 9.25004 2.29248V2.83613C6.08266 3.20733 3.62504 5.9004 3.62504 9.16748V14.4591H3.33337C2.91916 14.4591 2.58337 14.7949 2.58337 15.2091C2.58337 15.6234 2.91916 15.9591 3.33337 15.9591H4.37504H15.625H16.6667C17.0809 15.9591 17.4167 15.6234 17.4167 15.2091C17.4167 14.7949 17.0105 14.4591 16.6667 14.4591H16.375V9.16748C16.375 5.9004 13.9174 3.20733 10.75 2.83613V2.29248ZM14.875 14.4591V9.16748C14.875 6.47509 12.6924 4.29248 10 4.29248C7.30765 4.29248 5.12504 6.47509 5.12504 9.16748V14.4591H14.875ZM8.00004 17.7085C8.00004 18.1228 8.33583 18.4585 8.75004 18.4585H11.25C11.6643 18.4585 12 18.1228 12 17.7085C12 17.2943 11.6643 16.9585 11.25 16.9585H8.75004C8.33583 16.9585 8.00004 17.2943 8.00004 17.7085Z"
            fill="currentColor"
          />
        </svg>
      </button>

      <Dropdown
        isOpen={isOpen}
        onClose={closeDropdown}
        className="absolute -right-[240px] mt-[17px] flex h-[480px] w-[350px] flex-col rounded-2xl border border-gray-200 bg-white p-3 shadow-theme-lg dark:border-gray-800 dark:bg-gray-dark sm:w-[361px] lg:right-0"
      >
        <div className="flex items-center justify-between pb-3 mb-3 border-b border-gray-100 dark:border-gray-700">
          <h5 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
            Alertes Critiques
          </h5>
          <span className="bg-red-100 text-red-600 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase">
            {uiAlerts.filter(a => a.severity === "HIGH").length} Urgent
          </span>
        </div>

        <ul className="flex flex-col h-auto overflow-y-auto custom-scrollbar">
          {uiAlerts.length > 0 ? (
            uiAlerts.map((alert, index) => (
              <li key={index}>
                <DropdownItem
                  onItemClick={closeDropdown}
                  className="flex gap-3 rounded-lg border-b border-gray-100 p-3 px-4.5 py-3 hover:bg-gray-100 dark:border-gray-800 dark:hover:bg-white/5"
                  to={`/history?machine_id=${alert.machine_id}`}
                >
                  <div className={`flex items-center justify-center shrink-0 w-10 h-10 rounded-full ${alert.severity === "HIGH" ? "bg-red-100 text-red-600" : "bg-yellow-100 text-yellow-600"
                    }`}>
                    {alert.type.includes("TEMPÉRATURE") ? "🌡️" : alert.type.includes("VIBRATION") ? "📳" : "⚠️"}
                  </div>

                  <div className="block grow min-w-0">
                    <span className="mb-1 block text-xs font-bold text-gray-800 dark:text-white/90 truncate">
                      {alert.machine_id} : {alert.type}
                    </span>

                    <span className="block text-theme-xs text-gray-500 dark:text-gray-400">
                      Valeur : <span className="font-semibold text-gray-700 dark:text-gray-300">
                        {alert.currentValue?.toFixed(1) ?? "—"} {alert.unit}
                      </span>
                    </span>

                    <div className="flex items-center gap-2 mt-1 whitespace-nowrap overflow-hidden">
                      <span className={`text-[10px] font-bold px-1 rounded ${alert.severity === "HIGH" ? "text-red-600 bg-red-50" : "text-yellow-600 bg-yellow-50"
                        }`}>
                        {alert.severity}
                      </span>
                      <span className="w-1 h-1 bg-gray-300 rounded-full"></span>
                      <span className="text-[10px] text-gray-400">
                        {new Date(alert.timestamp).toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })}
                      </span>
                    </div>
                  </div>
                </DropdownItem>
              </li>
            ))
          ) : (
            <div className="flex flex-col items-center justify-center h-full py-10 opacity-50">
              <span className="text-3xl mb-2">✅</span>
              <p className="text-sm">Aucune alerte en attente</p>
            </div>
          )}
        </ul>

        <Link
          to="/alerts"
          onClick={closeDropdown}
          className="block px-4 py-2 mt-3 text-sm font-medium text-center text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-100 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
        >
          Voir toutes les alertes
        </Link>
      </Dropdown>
    </div>
  );
}

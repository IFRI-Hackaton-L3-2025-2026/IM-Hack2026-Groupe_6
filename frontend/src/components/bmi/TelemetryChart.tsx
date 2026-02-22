import { useEffect, useState } from "react";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";
import { api } from "../../API/api";

export default function TelemetryChart() {
    const [series, setSeries] = useState([
        { name: "Température (°C)", data: [] as number[] },
        { name: "Vibrations (Hz)", data: [] as number[] },
    ]);
    const [timestamps, setTimestamps] = useState<string[]>([]);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await api.get("/factory/realtime");
                if (response.data && response.data.length > 0) {
                    const data = response.data[0];

                    setSeries((prev) => [
                        {
                            ...prev[0],
                            data: [...prev[0].data, data.temperature || 0].slice(-20),
                        },
                        {
                            ...prev[1],
                            data: [...prev[1].data, data.vibration || 0].slice(-20),
                        },
                    ]);

                    const time = data.timestamp
                        ? new Date(data.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
                        : new Date().toLocaleTimeString();

                    setTimestamps((prev) => [...prev, time].slice(-20));
                }
            } catch (error) {
                console.error("Error fetching realtime data:", error);
            }
        };

        fetchData();
        const interval = setInterval(fetchData, 3000);
        return () => clearInterval(interval);
    }, []);

    const options: ApexOptions = {
        chart: {
            type: "area",
            height: 350,
            toolbar: { show: false },
            animations: {
                enabled: true,
                dynamicAnimation: { speed: 1000 }
            }
        },
        colors: ["#EF4444", "#3B82F6"],
        stroke: { curve: "smooth", width: 2 },
        fill: {
            type: "gradient",
            gradient: {
                shadeIntensity: 1,
                opacityFrom: 0.45,
                opacityTo: 0.05,
                stops: [20, 100, 100, 100]
            }
        },
        xaxis: {
            categories: timestamps,
            labels: { show: true, rotate: -45, style: { fontSize: "10px" } }
        },
        yaxis: {
            labels: { style: { colors: "#6B7280" } }
        },
        tooltip: { x: { show: true } },
        grid: { borderColor: "#E5E7EB", strokeDashArray: 4 }
    };

    return (
        <div className="rounded-2xl glass-card p-5 sm:p-6">
            <h3 className="mb-4 text-lg font-semibold text-gray-800 dark:text-white/90">
                Flux de Télémetrie en Direct
            </h3>
            <Chart options={options} series={series} type="area" height={350} />
        </div>
    );
}

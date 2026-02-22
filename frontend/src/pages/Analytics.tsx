import { useEffect, useState } from "react";
import PageMeta from "../components/common/PageMeta";
import { api } from "../API/api";
import Chart from "react-apexcharts";
import { ApexOptions } from "apexcharts";

interface AnalyticsKPIs {
    efficiency: number;
    total_machines: number;
    machines_at_risk: number;
    avg_temp: number;
    avg_vibration: number;
}

export default function Analytics() {
    const [kpis, setKpis] = useState<AnalyticsKPIs | null>(null);
    const [heatmapData, setHeatmapData] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAnalytics = async () => {
            try {
                const [kpiRes, heatRes] = await Promise.all([
                    api.get("/analytics/kpis"),
                    api.get("/analytics/heatmap")
                ]);
                setKpis(kpiRes.data);
                setHeatmapData(heatRes.data);
            } catch (error) {
                console.error("Error fetching analytics:", error);
            } finally {
                setLoading(false);
            }
        };
        fetchAnalytics();
    }, []);

    const performanceOptions: ApexOptions = {
        chart: { type: 'radialBar', height: 350 },
        plotOptions: {
            radialBar: {
                startAngle: -135,
                endAngle: 135,
                hollow: { size: '70%' },
                track: { background: "#e7e7e7", strokeWidth: '97%' },
                dataLabels: {
                    name: { show: true, fontSize: '14px', color: '#6B7280', offsetY: 100 },
                    value: {
                        show: true,
                        fontSize: '36px',
                        fontWeight: '800',
                        offsetY: 60,
                        formatter: (val) => val + "%"
                    },
                }
            }
        },
        fill: {
            type: 'gradient',
            gradient: {
                shade: 'dark',
                type: 'horizontal',
                gradientToColors: ['#10B981'],
                stops: [0, 100]
            }
        },
        stroke: { lineCap: 'round' },
        labels: ['Santé Usine'],
    };

    const heatmapOptions: ApexOptions = {
        chart: {
            height: 350,
            type: 'heatmap',
            toolbar: { show: false },
            background: 'transparent'
        },
        dataLabels: { enabled: false },
        colors: ["#3B82F6"], // Base color for heatmap
        plotOptions: {
            heatmap: {
                shadeIntensity: 0.5,
                radius: 0,
                useFillColorAsStroke: true,
                colorScale: {
                    ranges: [
                        { from: 0, to: 40, name: 'Normal', color: '#10B981' },
                        { from: 41, to: 70, name: 'Warning', color: '#F59E0B' },
                        { from: 71, to: 100, name: 'Critique', color: '#EF4444' }
                    ]
                }
            }
        },
        theme: { mode: 'light' }, // Will be overridden by CSS in dark mode
        xaxis: {
            labels: { show: false }
        }
    };

    return (
        <>
            <PageMeta
                title="Analytiques | BMI Factory"
                description="Analytique réelle basée sur les données capteurs."
            />
            <div className="space-y-6">
                <div className="flex flex-col gap-1">
                    <h1 className="text-2xl font-bold text-gray-800 dark:text-white/90">Analyse de Performance</h1>
                    <p className="text-sm text-gray-500">Diagnostic global basé sur 500 derniers relevés capteurs</p>
                </div>

                {loading ? (
                    <div className="flex items-center justify-center py-20">
                        <div className="w-8 h-8 rounded-full border-4 border-brand-500 border-t-transparent animate-spin" />
                    </div>
                ) : (
                    <div className="grid grid-cols-12 gap-6">

                        {/* Health Gauge */}
                        <div className="col-span-12 lg:col-span-4 p-6 bg-white border border-gray-200 rounded-2xl dark:bg-white/[0.03] dark:border-gray-800 flex flex-col items-center justify-center">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">Efficience Globale</h3>
                            <Chart
                                options={performanceOptions}
                                series={[kpis?.efficiency || 0]}
                                type="radialBar"
                                height={350}
                            />
                            <div className="grid grid-cols-2 gap-4 w-full mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                                <div className="text-center">
                                    <p className="text-[11px] uppercase text-gray-400">Machines à Risque</p>
                                    <p className="text-lg font-bold text-amber-500">{kpis?.machines_at_risk}</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-[11px] uppercase text-gray-400">Temp. Moyenne</p>
                                    <p className="text-lg font-bold text-gray-700 dark:text-gray-300">{kpis?.avg_temp}°C</p>
                                </div>
                            </div>
                        </div>

                        {/* Thermal Heatmap */}
                        <div className="col-span-12 lg:col-span-8 p-6 bg-white border border-gray-200 rounded-2xl dark:bg-white/[0.03] dark:border-gray-800">
                            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-6">Répartition Thermique par Secteur</h3>
                            <Chart
                                options={heatmapOptions}
                                series={heatmapData}
                                type="heatmap"
                                height={320}
                            />
                            <p className="mt-4 text-[10px] text-gray-400 italic">
                                * Chaque carré représente une machine. La couleur indique l'état thermique normalisé (Vert: &lt;40, Orange: 40-70, Rouge: &gt;70).
                            </p>
                        </div>

                    </div>
                )}
            </div>
        </>
    );
}

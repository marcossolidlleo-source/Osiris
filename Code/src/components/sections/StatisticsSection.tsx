import { useEffect, useRef } from 'react';
import { Chart, registerables } from 'chart.js';
import type { SensorData } from '../../types';

Chart.register(...registerables);

interface Props {
  sessionHistory: SensorData[];
}

export default function StatisticsSection({ sessionHistory }: Props) {
  const lineRef = useRef<HTMLCanvasElement>(null);
  const radarRef = useRef<HTMLCanvasElement>(null);
  const lineChartRef = useRef<Chart | null>(null);
  const radarChartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!lineRef.current || !radarRef.current) return;

    if (lineChartRef.current) lineChartRef.current.destroy();
    if (radarChartRef.current) radarChartRef.current.destroy();

    lineChartRef.current = new Chart(lineRef.current, {
      type: 'line',
      data: {
        labels: Array(10).fill('-'),
        datasets: [
          {
            label: 'Humedad (%)',
            data: Array(10).fill(0),
            borderColor: '#1a5d1a',
            backgroundColor: 'rgba(26, 93, 26, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Temperatura (°C)',
            data: Array(10).fill(0),
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          x: { grid: { display: false } },
          y: { beginAtZero: true, min: 0, max: 100, grid: { color: '#f3f4f6' } },
        },
      },
    });

    radarChartRef.current = new Chart(radarRef.current, {
      type: 'radar',
      data: {
        labels: ['Humedad', 'Temperatura', 'pH', 'Luz (x100)'],
        datasets: [
          {
            label: 'Actual',
            data: [0, 0, 0, 0],
            borderColor: '#1a5d1a',
            backgroundColor: 'rgba(26, 93, 26, 0.4)',
            borderWidth: 2,
          },
          {
            label: 'Ideal',
            data: [60, 24, 6.5, 8],
            borderColor: '#4caf50',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderDash: [5, 5],
            borderWidth: 2,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        scales: { r: { beginAtZero: true, min: 0, max: 100 } },
      },
    });

    return () => {
      lineChartRef.current?.destroy();
      radarChartRef.current?.destroy();
    };
  }, []);

  useEffect(() => {
    if (!lineChartRef.current || !radarChartRef.current || sessionHistory.length === 0) return;

    lineChartRef.current.data.labels = sessionHistory.map((_, i) => `T-${sessionHistory.length - 1 - i}`);
    lineChartRef.current.data.datasets[0].data = sessionHistory.map(d => d.humedad);
    lineChartRef.current.data.datasets[1].data = sessionHistory.map(d => parseFloat(d.temperatura));
    lineChartRef.current.update('none');

    const last = sessionHistory[sessionHistory.length - 1];
    radarChartRef.current.data.datasets[0].data = [
      last.humedad,
      parseFloat(last.temperatura),
      parseFloat(last.ph),
      last.iluminacion / 100,
    ];
    radarChartRef.current.update('none');
  }, [sessionHistory]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6 mb-20">
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
        <h3 className="text-xl font-bold text-[#1a5d1a] mb-6 w-full text-left flex items-center gap-2">
          <i className="fas fa-chart-line text-[#4caf50]" /> Tendencia de Cultivo (24h)
        </h3>
        <div className="w-full relative" style={{ height: 300 }}>
          <canvas ref={lineRef} />
        </div>
      </div>
      <div className="bg-white p-6 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
        <h3 className="text-xl font-bold text-[#1a5d1a] mb-6 w-full text-left flex items-center gap-2">
          <i className="fas fa-bullseye text-[#4caf50]" /> Balance de Nutrientes y Luz
        </h3>
        <div className="w-full relative" style={{ height: 300 }}>
          <canvas ref={radarRef} />
        </div>
      </div>
    </div>
  );
}

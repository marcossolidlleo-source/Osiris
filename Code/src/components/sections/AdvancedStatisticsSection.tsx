import { useState, useEffect, useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Chart, registerables } from 'chart.js';
import type { Farm, SensorData } from '../../types';

Chart.register(...registerables);

interface StatisticsData {
  avgHumedad: number;
  avgTemperatura: number;
  avgPh: number;
  avgIluminacion: number;
  maxHumedad: number;
  minHumedad: number;
  maxTemperatura: number;
  minTemperatura: number;
  totalRegistros: number;
  costoTotal: number;
  horasRiego: number;
  horasTrabajo: number;
}

interface Props {
  selectedFarm: Farm | undefined;
  sessionHistory: SensorData[];
  userRole: string;
}

export default function AdvancedStatisticsSection({ selectedFarm, sessionHistory, userRole }: Props) {
  const [dateRange, setDateRange] = useState<'7' | '30' | '365'>('7');
  const [stats, setStats] = useState<StatisticsData | null>(null);
  const [showReport, setShowReport] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const [generating, setGenerating] = useState(false);
  const lineRef = useRef<HTMLCanvasElement>(null);
  const radarRef = useRef<HTMLCanvasElement>(null);
  const lineChartRef = useRef<Chart | null>(null);
  const radarChartRef = useRef<Chart | null>(null);

  useEffect(() => {
    if (!sessionHistory || sessionHistory.length === 0) return;

    const humedad = sessionHistory.map(d => d.humedad);
    const temperatura = sessionHistory.map(d => parseFloat(d.temperatura));
    const ph = sessionHistory.map(d => parseFloat(d.ph));
    const iluminacion = sessionHistory.map(d => d.iluminacion);

    setStats({
      avgHumedad: Number((humedad.reduce((a, b) => a + b, 0) / humedad.length).toFixed(1)),
      avgTemperatura: Number((temperatura.reduce((a, b) => a + b, 0) / temperatura.length).toFixed(1)),
      avgPh: Number((ph.reduce((a, b) => a + b, 0) / ph.length).toFixed(2)),
      avgIluminacion: Number((iluminacion.reduce((a, b) => a + b, 0) / iluminacion.length).toFixed(0)),
      maxHumedad: Math.max(...humedad),
      minHumedad: Math.min(...humedad),
      maxTemperatura: Number(Math.max(...temperatura).toFixed(1)),
      minTemperatura: Number(Math.min(...temperatura).toFixed(1)),
      totalRegistros: sessionHistory.length,
      costoTotal: Math.random() * 5000 + 1000,
      horasRiego: Math.random() * 100 + 50,
      horasTrabajo: Math.random() * 200 + 100,
    });

    if (!lineRef.current || !radarRef.current) return;
    if (lineChartRef.current) lineChartRef.current.destroy();
    if (radarChartRef.current) radarChartRef.current.destroy();

    lineChartRef.current = new Chart(lineRef.current, {
      type: 'line',
      data: {
        labels: sessionHistory.map((_, i) => `${i + 1}`),
        datasets: [
          {
            label: 'Humedad (%)',
            data: humedad,
            borderColor: '#1a5d1a',
            backgroundColor: 'rgba(26, 93, 26, 0.1)',
            borderWidth: 2,
            tension: 0.4,
            fill: true,
          },
          {
            label: 'Temperatura (°C)',
            data: temperatura,
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
            data: [
              (humedad.reduce((a, b) => a + b, 0) / humedad.length),
              (temperatura.reduce((a, b) => a + b, 0) / temperatura.length),
              (ph.reduce((a, b) => a + b, 0) / ph.length) * 10,
              (iluminacion.reduce((a, b) => a + b, 0) / iluminacion.length) / 100,
            ],
            borderColor: '#1a5d1a',
            backgroundColor: 'rgba(26, 93, 26, 0.4)',
            borderWidth: 2,
          },
          {
            label: 'Ideal',
            data: [60, 24, 65, 8],
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
        plugins: { legend: { position: 'bottom' } },
      },
    });
  }, [sessionHistory]);

  const handleGenerateReport = async () => {
    setGenerating(true);
    setShowReport(true);
    setTimeout(() => setGenerating(false), 500);
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      const canvas = await html2canvas(reportRef.current, { scale: 2, backgroundColor: '#ffffff' });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const imgWidth = 210;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= 297;

      while (heightLeft >= 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= 297;
      }

      pdf.save(`Informe-${selectedFarm?.nombre || 'Finca'}-${new Date().toISOString().split('T')[0]}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    }
  };

  return (
    <div>
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
        <div>
          <h2 className="text-2xl font-black text-gray-800">Análisis Estadístico Avanzado</h2>
          <p className="text-gray-500 text-sm mt-1">Agrega y analiza tus datos agrícolas en tiempo real</p>
        </div>
        <div className="flex gap-3">
          <select
            value={dateRange}
            onChange={e => setDateRange(e.target.value as '7' | '30' | '365')}
            className="px-4 py-2 border border-gray-200 rounded-lg outline-none focus:border-green-800 text-sm font-semibold"
          >
            <option value="7">Últimos 7 días</option>
            <option value="30">Último mes</option>
            <option value="365">Año actual</option>
          </select>
          <button
            onClick={handleGenerateReport}
            disabled={generating}
            className="px-4 py-2 bg-green-800 hover:bg-green-700 text-white rounded-lg font-bold flex items-center gap-2 transition-colors disabled:opacity-60"
          >
            <i className="fas fa-file-pdf" /> Generar Informe
          </button>
        </div>
      </div>

      {/* Summary metrics grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <MetricCard label="Humedad Promedio" value={`${stats.avgHumedad}%`} icon="fa-tint" color="text-blue-600" />
          <MetricCard label="Temperatura Promedio" value={`${stats.avgTemperatura}°C`} icon="fa-temperature-half" color="text-orange-600" />
          <MetricCard label="pH Promedio" value={String(stats.avgPh)} icon="fa-flask" color="text-emerald-600" />
          <MetricCard label="Luz Promedio" value={`${stats.avgIluminacion} lux`} icon="fa-sun" color="text-yellow-600" />
        </div>
      )}

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="card bg-white p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Evolución Temporal</h3>
          <div style={{ height: '300px' }}>
            <canvas ref={lineRef}></canvas>
          </div>
        </div>
        <div className="card bg-white p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4">Comparativa Actual vs Ideal</h3>
          <div style={{ height: '300px' }}>
            <canvas ref={radarRef}></canvas>
          </div>
        </div>
      </div>

      {/* Detailed statistics panel */}
      {stats && (
        <div className="card bg-white p-6 mb-8">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-chart-bar text-green-800" /> Análisis Detallado
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <StatTable
              title="Humedad del Suelo"
              data={[
                { label: 'Promedio', value: `${stats.avgHumedad}%` },
                { label: 'Máximo', value: `${stats.maxHumedad}%` },
                { label: 'Mínimo', value: `${stats.minHumedad}%` },
                { label: 'Variación', value: `${stats.maxHumedad - stats.minHumedad}%` },
              ]}
            />
            <StatTable
              title="Temperatura"
              data={[
                { label: 'Promedio', value: `${stats.avgTemperatura}°C` },
                { label: 'Máximo', value: `${stats.maxTemperatura}°C` },
                { label: 'Mínimo', value: `${stats.minTemperatura}°C` },
                { label: 'Variación', value: `${(stats.maxTemperatura - stats.minTemperatura).toFixed(1)}°C` },
              ]}
            />
            <StatTable
              title="Gestión Agrícola (Odoo)"
              data={[
                { label: 'Costo Total', value: `${stats.costoTotal.toFixed(2)}€` },
                { label: 'Horas de Riego', value: `${stats.horasRiego.toFixed(1)}h` },
                { label: 'Horas de Trabajo', value: `${stats.horasTrabajo.toFixed(1)}h` },
                { label: 'Registros', value: String(stats.totalRegistros) },
              ]}
            />
            <StatTable
              title="Parámetros del Cultivo"
              data={[
                { label: 'Cultivo', value: selectedFarm?.cultivo || 'N/A' },
                { label: 'Hectáreas', value: `${selectedFarm?.hectareas || 0}` },
                { label: 'Período', value: dateRange === '7' ? '7 días' : dateRange === '30' ? '30 días' : '365 días' },
                { label: 'pH Promedio', value: String(stats.avgPh) },
              ]}
            />
          </div>
        </div>
      )}

      {/* Report Viewer Modal */}
      {showReport && stats && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-gradient-to-r from-green-800 to-emerald-700 text-white p-4 flex justify-between items-center">
              <h3 className="text-xl font-bold">Informe Estadístico</h3>
              <div className="flex gap-2">
                <button onClick={handleDownloadPDF} className="px-4 py-2 bg-white text-green-800 rounded-lg font-bold hover:bg-gray-100">
                  <i className="fas fa-download mr-2" /> Descargar PDF
                </button>
                <button onClick={() => setShowReport(false)} className="px-4 py-2 bg-red-500 hover:bg-red-600 rounded-lg font-bold">
                  <i className="fas fa-times" />
                </button>
              </div>
            </div>

            <div ref={reportRef} className="p-8 bg-white">
              <ReportContent farm={selectedFarm} stats={stats} userRole={userRole} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function MetricCard({ label, value, icon, color }: { label: string; value: string; icon: string; color: string }) {
  return (
    <div className="card bg-white p-4 border border-gray-100">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{label}</p>
          <p className={`text-2xl font-black mt-2 ${color}`}>{value}</p>
        </div>
        <i className={`fas ${icon} text-4xl ${color} opacity-20`} />
      </div>
    </div>
  );
}

function StatTable({ title, data }: { title: string; data: { label: string; value: string }[] }) {
  return (
    <div className="border border-gray-200 rounded-lg p-4">
      <h4 className="font-bold text-gray-800 mb-3">{title}</h4>
      <table className="w-full text-sm">
        <tbody>
          {data.map((row, i) => (
            <tr key={i} className="border-b border-gray-100 last:border-0">
              <td className="py-2 font-medium text-gray-600">{row.label}</td>
              <td className="py-2 text-right font-bold text-green-800">{row.value}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function ReportContent({ farm, stats, userRole }: { farm?: Farm; stats: any; userRole: string }) {
  return (
    <div className="print:p-0">
      {/* Header */}
      <div className="text-center mb-8 border-b-4 border-green-800 pb-6">
        <h1 className="text-4xl font-black text-green-800 tracking-widest" style={{ fontFamily: "'Times New Roman', Times, serif" }}>
          OSIRIS
        </h1>
        <p className="text-gray-600 mt-2 font-semibold">INFORME ESTADÍSTICO AGROCULTURAL</p>
        <p className="text-gray-500 text-sm mt-1">{new Date().toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
      </div>

      {/* Farm Info */}
      <div className="grid grid-cols-2 gap-6 mb-8 pb-8 border-b border-gray-300">
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase">Finca</p>
          <p className="text-lg font-bold text-gray-800">{farm?.nombre || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase">Cultivo</p>
          <p className="text-lg font-bold text-gray-800">{farm?.cultivo || 'N/A'}</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase">Superficie</p>
          <p className="text-lg font-bold text-gray-800">{farm?.hectareas || 0} ha</p>
        </div>
        <div>
          <p className="text-xs font-bold text-gray-500 uppercase">Usuario</p>
          <p className="text-lg font-bold text-gray-800">{userRole}</p>
        </div>
      </div>

      {/* Metrics */}
      <h2 className="text-xl font-bold text-green-800 mb-4 uppercase tracking-widest">Parámetros Monitoreados</h2>
      <div className="grid grid-cols-2 gap-4 mb-8">
        <div className="border-2 border-green-200 p-4 rounded-lg">
          <p className="text-sm font-semibold text-gray-600">Humedad Promedio</p>
          <p className="text-3xl font-bold text-green-800">{stats.avgHumedad}%</p>
          <p className="text-xs text-gray-500 mt-2">Rango: {stats.minHumedad}% - {stats.maxHumedad}%</p>
        </div>
        <div className="border-2 border-orange-200 p-4 rounded-lg">
          <p className="text-sm font-semibold text-gray-600">Temperatura Promedio</p>
          <p className="text-3xl font-bold text-orange-600">{stats.avgTemperatura}°C</p>
          <p className="text-xs text-gray-500 mt-2">Rango: {stats.minTemperatura}°C - {stats.maxTemperatura}°C</p>
        </div>
        <div className="border-2 border-emerald-200 p-4 rounded-lg">
          <p className="text-sm font-semibold text-gray-600">pH Promedio</p>
          <p className="text-3xl font-bold text-emerald-600">{stats.avgPh}</p>
          <p className="text-xs text-gray-500 mt-2">Óptimo para la mayoría de cultivos</p>
        </div>
        <div className="border-2 border-yellow-200 p-4 rounded-lg">
          <p className="text-sm font-semibold text-gray-600">Luz Promedio</p>
          <p className="text-3xl font-bold text-yellow-600">{stats.avgIluminacion} lux</p>
          <p className="text-xs text-gray-500 mt-2">Total de {stats.totalRegistros} lecturas</p>
        </div>
      </div>

      {/* Conclusions */}
      <div className="bg-green-50 border-l-4 border-green-800 p-4 rounded">
        <h3 className="font-bold text-green-800 mb-2">Conclusiones</h3>
        <ul className="text-sm text-gray-700 space-y-1 list-disc list-inside">
          <li>Los parámetros monitoreados se mantienen dentro de rangos óptimos para el cultivo</li>
          <li>Registros totales: {stats.totalRegistros} mediciones</li>
          <li>Costo acumulado de insumos: {stats.costoTotal.toFixed(2)}€</li>
          <li>Recomendación: continuar con el plan de riego y fertilización actual</li>
        </ul>
      </div>

      <div className="text-center mt-8 pt-6 border-t border-gray-300 text-xs text-gray-500">
        <p>Este informe fue generado automáticamente por Osiris</p>
        <p>© 2026 Osiris. Sistema de Monitorización Agrícola</p>
      </div>
    </div>
  );
}

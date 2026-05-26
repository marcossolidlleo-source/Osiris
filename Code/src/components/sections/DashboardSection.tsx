import { useState, useEffect, useRef } from 'react';
import type { Farm, CustomSensor, SensorData, HistoricalRecord } from '../../types';
import { CROPS } from '../../data/crops';
import Map3DComponent from './Map3DComponent'; // Asegura la ruta correcta
interface Props {
  userRole: string;
  farms: Farm[];
  selectedFarmId: number;
  onSelectFarm: (id: number) => void;
  onAddFarm: (name: string, hectares: number) => void;
  customSensors: CustomSensor[];
  onAddSensor: (sensor: Omit<CustomSensor, 'id' | 'valorActual' | 'x' | 'z'>) => void;
  sensorData: SensorData | null;
  onSimulate: () => void;
  sessionHistory: SensorData[];
  agriculturalData: any[];
}



export default function DashboardSection({
  userRole, farms, selectedFarmId, onSelectFarm, onAddFarm,
  customSensors, onAddSensor, sensorData, onSimulate,
  sessionHistory, agriculturalData, 
}: Props) {
  const [newFarmName, setNewFarmName] = useState('');
  const [newFarmHa, setNewFarmHa] = useState('');
  const [newFarmCultivo, setNewFarmCultivo] = useState(CROPS[0].nombre);
  const [newFarmSector, setNewFarmSector] = useState('');
  const [plotName, setPlotName] = useState('');
  const [cropType, setCropType] = useState(CROPS[0].nombre);
  const [metricType, setMetricType] = useState('Humedad');
  const [idealValue, setIdealValue] = useState('');
  const [locationMode, setLocationMode] = useState('zona');
  const [sensorFarmId, setSensorFarmId] = useState(selectedFarmId);
  const [historyStart, setHistoryStart] = useState('');
  const [historyEnd, setHistoryEnd] = useState('');
  const [sensorFilter, setSensorFilter] = useState('Todos');
  const [historyResults, setHistoryResults] = useState<HistoricalRecord[]>([]);
  const [historyShown, setHistoryShown] = useState(false);
  const [avgTemp, setAvgTemp] = useState('');
  const [avgHum, setAvgHum] = useState('');
  const lastUpdateRef = useRef<string>('Actualizando...');

  const userFarms = farms;
  const selectedFarm = farms.find(f => f.id === selectedFarmId);
  const filteredSensors = customSensors.filter(s => s.farmId === selectedFarmId);

  useEffect(() => {
    setSensorFarmId(selectedFarmId);
  }, [selectedFarmId]);

  useEffect(() => {
    if (sensorData) {
      const now = new Date();
      lastUpdateRef.current = `Última: ${now.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}`;
    }
  }, [sensorData]);

  const handleAddFarm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFarmName || !newFarmHa || !newFarmSector) return;
    onAddFarm(newFarmName, parseFloat(newFarmHa), newFarmCultivo, newFarmSector);
    setNewFarmName('');
    setNewFarmHa('');
    setNewFarmCultivo(CROPS[0].nombre);
    setNewFarmSector('');
  };

  const handleAddSensor = (e: React.FormEvent) => {
    e.preventDefault();
    onAddSensor({
      farmId: sensorFarmId,
      nombre: plotName,
      cultivo: cropType,
      metrica: metricType,
      ideal: idealValue,
      locationMode,
    });
    setPlotName(''); setIdealValue('');
  };

  const handleFilterHistory = () => {
  if (!historyStart || !historyEnd) return;

  const filtered = agriculturalData.filter((r: any) => {
    const fecha = (r.created_at?.split('T')[0] ?? r.fecha_registro ?? '').split(' ')[0];
    return fecha >= historyStart && fecha <= historyEnd;
  });

  const sorted = filtered
    .filter((r: any) => r.temperatura_ambiente !== null && r.humedad_suelo !== null)
    .sort((a: any, b: any) =>
      new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
    );

  setHistoryResults(sorted.map((r: any) => ({
    fecha: r.created_at?.replace('T', ' ').split('.')[0] ?? r.fecha_registro,
    finca: selectedFarm?.nombre ?? farms[0]?.nombre ?? 'Finca',
    temperatura: String(Number(r.temperatura_ambiente).toFixed(1)),
    humedad: Number(r.humedad_suelo),
  })));

  setHistoryShown(true);

  if (sorted.length > 0) {
    const sT = sorted.reduce((s: number, r: any) => s + Number(r.temperatura_ambiente), 0);
    const sH = sorted.reduce((s: number, r: any) => s + Number(r.humedad_suelo), 0);
    setAvgTemp((sT / sorted.length).toFixed(1));
    setAvgHum(String(Math.round(sH / sorted.length)));
  }
};


  const isLowHumidity = sensorData && sensorData.humedad < 30;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-black text-gray-800">Resumen General</h2>
        <button
          onClick={onSimulate}
          className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded-xl shadow-md transition-colors flex items-center gap-2"
        >
          <i className="fas fa-vial" /> Simular Datos
        </button>
      </div>

      {/* Farm info + register */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card bg-gradient-to-br from-emerald-600 to-green-700 p-6 text-white overflow-hidden relative">
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-black mb-1">{selectedFarm?.nombre || 'Sin finca'}</h2>
                <p className="text-emerald-100 text-xs font-bold uppercase tracking-widest italic opacity-80">
                  Sector {selectedFarm?.sector || 'General'}
                </p>
              </div>
              <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-md border border-white/30">
                <i className="fas fa-map-marked-alt text-xl text-yellow-300" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-black/10 p-3 rounded-xl border border-white/10">
                <p className="text-[0.65rem] font-bold text-emerald-200 uppercase mb-1">Superficie</p>
                <p className="text-xl font-black">{selectedFarm?.hectareas ?? '--'} ha</p>
              </div>
              <div className="bg-black/10 p-3 rounded-xl border border-white/10">
                <p className="text-[0.65rem] font-bold text-emerald-200 uppercase mb-1">Cultivo</p>
                <p className="text-xl font-black">{selectedFarm?.cultivo || '--'}</p>
              </div>
            </div>
          </div>
        </div>

        <div className="card bg-white border border-dashed border-emerald-300 p-6 flex flex-col justify-between hover:border-emerald-500 transition-all group">
          <h3 className="text-emerald-800 font-black text-lg mb-4 flex items-center gap-2">
            <i className="fas fa-plus-circle text-emerald-500 group-hover:rotate-90 transition-transform" />
            Registrar Nueva Finca
          </h3>
          <form onSubmit={handleAddFarm} className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[0.65rem] font-black text-gray-400 uppercase ml-1">Nombre</label>
                <input type="text" value={newFarmName} onChange={e => setNewFarmName(e.target.value)}
                  placeholder="Ej: Los Pinos"
                  className="w-full text-sm p-3 border border-gray-100 rounded-xl outline-none focus:border-emerald-500 transition-colors bg-gray-50" required />
              </div>
              <div>
                <label className="text-[0.65rem] font-black text-gray-400 uppercase ml-1">Hectáreas</label>
                <input type="number" value={newFarmHa} onChange={e => setNewFarmHa(e.target.value)}
                  placeholder="Ej: 4.5" step="0.1"
                  className="w-full text-sm p-3 border border-gray-100 rounded-xl outline-none focus:border-emerald-500 transition-colors bg-gray-50" required />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[0.65rem] font-black text-gray-400 uppercase ml-1">Cultivo</label>
                <select value={newFarmCultivo} onChange={e => setNewFarmCultivo(e.target.value)}
                  className="w-full text-sm p-3 border border-gray-100 rounded-xl outline-none focus:border-emerald-500 transition-colors bg-gray-50" required>
                  {CROPS.map(c => (
                    <option key={c.nombre} value={c.nombre}>{c.emoji} {c.nombre}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-[0.65rem] font-black text-gray-400 uppercase ml-1">Sector</label>
                <input type="text" value={newFarmSector} onChange={e => setNewFarmSector(e.target.value)}
                  placeholder="Ej: Norte"
                  className="w-full text-sm p-3 border border-gray-100 rounded-xl outline-none focus:border-emerald-500 transition-colors bg-gray-50" required />
              </div>
            </div>
            <button type="submit" className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl transition-all shadow-sm">
              Guardar Finca
            </button>
          </form>
        </div>
      </div>

      {/* Farm tabs */}
      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        {userFarms.map(farm => (
          <button
            key={farm.id}
            onClick={() => onSelectFarm(farm.id)}
            className={`px-4 py-2 rounded-xl border-2 transition-all whitespace-nowrap font-bold text-sm ${selectedFarmId === farm.id ? 'bg-emerald-600 border-emerald-600 text-white shadow-md' : 'bg-white border-gray-100 text-gray-500 hover:border-emerald-200'}`}
          >
            <i className="fas fa-leaf mr-2" />{farm.nombre}
          </button>
        ))}
      </div>

      {/* Add sensor form */}
      <div className="add-sensor-form tracking-wide">
        <h3 className="text-[#1a5d1a] text-xl font-semibold mb-6 flex items-center gap-2">
          <i className="fas fa-microchip text-primary" />Configurar Nuevo Sensor
        </h3>
        <form onSubmit={handleAddSensor}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="form-group">
              <label>Nombre de la Parcela / Sector</label>
              <input type="text" value={plotName} onChange={e => setPlotName(e.target.value)} placeholder="Ej: Sector Norte" required />
            </div>
            <div className="form-group">
              <label>Vincular a Finca</label>
              <select value={sensorFarmId} onChange={e => setSensorFarmId(Number(e.target.value))} className="w-full text-sm p-3 border border-gray-200 rounded-xl bg-gray-50 font-bold text-gray-700">
                {userFarms.map(f => <option key={f.id} value={f.id}>{f.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Tipo de Cultivo</label>
              <select value={cropType} onChange={e => setCropType(e.target.value)} className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-none focus:border-primary transition-colors bg-gray-50 text-gray-700">
                {CROPS.map(c => <option key={c.nombre} value={c.nombre}>{c.emoji} {c.nombre}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Métrica a Medir</label>
              <select value={metricType} onChange={e => setMetricType(e.target.value)}>
                <option value="Humedad">Humedad (%)</option>
                <option value="Temperatura">Temperatura (°C)</option>
                <option value="pH">Nivel de pH</option>
                <option value="Luz">Luz (lux)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Valor Ideal (Referencia)</label>
              <input type="number" value={idealValue} onChange={e => setIdealValue(e.target.value)} placeholder="Ej: 60" step="0.1" required />
            </div>
            <div className="form-group md:col-span-2">
              <label>Opciones de Ubicación en el Modelo 3D</label>
              <select value={locationMode} onChange={e => setLocationMode(e.target.value)} className="w-full text-sm p-3 border border-gray-200 rounded-xl outline-none focus:border-primary transition-colors bg-gray-50 text-gray-700">
                <option value="zona">Mantener en la zona asignada (si coincide el cultivo)</option>
                <option value="todo">Asignar a todo el cultivo (calcular posición con fórmula matemática)</option>
              </select>
            </div>
          </div>
          <button type="submit" className="w-full mt-4 py-4 bg-[#2e7d32] hover:bg-[#1b5e20] text-white font-bold rounded-xl uppercase tracking-widest text-sm flex items-center justify-center gap-2 transition-colors">
            <i className="fas fa-plus" /> Añadir Sensor al Sistema
          </button>
        </form>
      </div>

      {/* Custom sensors */}
      {filteredSensors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {filteredSensors.map(s => (
            <div key={s.id} className="custom-sensor-card flex justify-between items-center">
              <div>
                <p className="font-bold text-gray-800">{s.nombre} ({s.cultivo})</p>
                <p className="text-xs text-gray-500">{s.metrica} - Ideal: {s.ideal}</p>
              </div>
              <div className="text-right">
                <p className="text-xl font-black text-emerald-600">{s.valorActual}</p>
              </div>
            </div>
          ))}
        </div>
      )}
      {filteredSensors.length === 0 && (
        <p className="text-center text-gray-400 italic py-4 mb-4">No hay sensores adicionales en esta finca.</p>
      )}

      {/* Real-time sensor cards */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-green-800">Datos en Tiempo Real</h2>
          <div className="flex items-center text-sm text-gray-500">
            <i className="fas fa-clock mr-1" />
            <span>{lastUpdateRef.current}</span>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {sensorData ? (
            <>
              <SensorCard
                title="Humedad del Suelo"
                value={`${sensorData.humedad}%`}
                icon="fa-droplet"
                alert={isLowHumidity ?? false}
                alertText="Riesgo de Sequía"
                iconBg={isLowHumidity ? 'bg-red-100 text-red-600' : 'bg-blue-50 text-blue-500'}
                containerClass={isLowHumidity ? 'bg-red-50 border-red-300 ring-4 ring-red-100' : 'bg-white border-gray-100'}
                textClass={isLowHumidity ? 'text-red-700' : 'text-gray-900'}
              />
              <SensorCard title="Temperatura Ambiental" value={`${sensorData.temperatura} °C`} icon="fa-temperature-half" alert={false} alertText="" iconBg="bg-orange-50 text-orange-500" containerClass="bg-white border-gray-100" textClass="text-gray-900" />
              <SensorCard title="Nivel de pH (Suelo)" value={String(sensorData.ph)} icon="fa-flask" alert={false} alertText="" iconBg="bg-emerald-50 text-emerald-500" containerClass="bg-white border-gray-100" textClass="text-gray-900" />
              <SensorCard title="Iluminación Solar" value={`${sensorData.iluminacion} lux`} icon="fa-sun" alert={false} alertText="" iconBg="bg-yellow-50 text-yellow-500" containerClass="bg-white border-gray-100" textClass="text-gray-900" />
            </>
          ) : (
            [1, 2, 3, 4].map(i => (
              <div key={i} className="w-full rounded-2xl p-6 border bg-gray-100 animate-pulse h-28" />
            ))
          )}
        </div>
      </div>

      {/* History filter */}
      <div className="card bg-white p-5 mb-6">
        <h2 className="text-lg font-semibold text-green-800 mb-4">Historial y Análisis de Sensores</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Fecha de Inicio</label>
            <input type="date" value={historyStart} onChange={e => setHistoryStart(e.target.value)} className="input-field w-full px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Fecha Fin</label>
            <input type="date" value={historyEnd} onChange={e => setHistoryEnd(e.target.value)} className="input-field w-full px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-500 mb-1">Métrica (Sensor)</label>
            <select value={sensorFilter} onChange={e => setSensorFilter(e.target.value)} className="input-field w-full px-3 py-2">
              <option value="Todos">Ambos (Temp y Humedad)</option>
              <option value="Temperatura">Solo Temperatura</option>
              <option value="Humedad">Solo Humedad</option>
            </select>
          </div>
          <div className="flex items-end">
            <button onClick={handleFilterHistory} className="btn-primary w-full py-2 h-[42px] text-white font-semibold text-sm px-2 whitespace-nowrap">
              <i className="fas fa-search mr-1" />Filtrar y Analizar
            </button>
          </div>
        </div>

        {!historyShown && (
          <p className="text-center text-gray-400 italic mb-4">Selecciona fechas y un sensor para analizar el historial</p>
        )}

        {historyShown && historyResults.length > 0 && (avgTemp || avgHum) && (
          <div className="mb-4 p-4 bg-green-50 text-green-900 rounded-lg border border-green-200 shadow-sm flex items-center gap-6">
            <span className="text-sm font-bold uppercase tracking-wider opacity-80"><i className="fas fa-chart-pie mr-2" /> Análisis de la Selección (Media)</span>
            {(sensorFilter === 'Temperatura' || sensorFilter === 'Todos') && (
              <div><span className="text-xs text-green-800 uppercase block">Temp. Media</span><span className="text-xl font-bold bg-white px-3 py-1 rounded-md shadow-sm text-green-700">{avgTemp} °C</span></div>
            )}
            {(sensorFilter === 'Humedad' || sensorFilter === 'Todos') && (
              <div><span className="text-xs text-green-800 uppercase block">Humedad Media</span><span className="text-xl font-bold bg-white px-3 py-1 rounded-md shadow-sm text-green-700">{avgHum}%</span></div>
            )}
          </div>
        )}

        {historyShown && (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-green-50 text-green-800 border-b-2 border-green-200">
                  <th className="p-3 font-semibold text-sm">Fecha</th>
                  <th className="p-3 font-semibold text-sm">Finca</th>
                  {(sensorFilter === 'Temperatura' || sensorFilter === 'Todos') && <th className="p-3 font-semibold text-center text-sm">Temperatura</th>}
                  {(sensorFilter === 'Humedad' || sensorFilter === 'Todos') && <th className="p-3 font-semibold text-center text-sm">Humedad</th>}
                </tr>
              </thead>
              <tbody>
                {historyResults.length === 0 ? (
                  <tr><td colSpan={4} className="p-4 text-center text-gray-400 italic">No hay registros para estas fechas</td></tr>
                ) : historyResults.map((r, i) => (
                  <tr key={i} className="hover:bg-gray-50 transition-colors border-b border-gray-100 last:border-0">
                    <td className="p-3 text-sm font-medium text-gray-800">{r.fecha}</td>
                    <td className="p-3 text-sm text-gray-600">{r.finca}</td>
                    {(sensorFilter === 'Temperatura' || sensorFilter === 'Todos') && <td className="p-3 text-sm text-center font-semibold text-orange-600">{r.temperatura} °C</td>}
                    {(sensorFilter === 'Humedad' || sensorFilter === 'Todos') && <td className="p-3 text-sm text-center font-semibold text-blue-600">{r.humedad}%</td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function SensorCard({ title, value, icon, alert, alertText, iconBg, containerClass, textClass }: {
  title: string; value: string; icon: string; alert: boolean; alertText: string;
  iconBg: string; containerClass: string; textClass: string;
}) {
  return (
    <div className={`${containerClass} w-full rounded-2xl p-6 md:p-8 flex items-center justify-between border transition-all duration-300 transform hover:-translate-y-1 hover:shadow-lg shadow-sm`}>
      <div className="flex flex-col">
        <p className="text-gray-500 text-sm font-bold mb-1 uppercase tracking-wider">{title}</p>
        <h4 className={`${textClass} text-4xl md:text-5xl font-black mb-1`}>{value}</h4>
        {alert && (
          <span className="mt-2 text-xs font-bold text-red-600 bg-red-100 px-2 py-1 rounded w-fit flex items-center">
            <i className="fas fa-triangle-exclamation mr-1" /> {alertText}
          </span>
        )}
      </div>
      <div className={`w-16 h-16 md:w-20 md:h-20 rounded-full ${iconBg} flex items-center justify-center shrink-0`}>
        <i className={`fa-solid ${icon} text-3xl md:text-4xl`} />
      </div>
    </div>
  );
}

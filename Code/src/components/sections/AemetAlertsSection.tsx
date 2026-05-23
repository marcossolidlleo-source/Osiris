import { useState, useEffect } from 'react';
import type { Farm } from '../../types';

interface Alert {
  type: string;
  level: 'info' | 'warning' | 'critical';
  description: string;
  period: string;
  icon: string;
}

interface FireRisk {
  level: 'Bajo' | 'Moderado' | 'Alto' | 'Muy Alto' | 'Extremo';
  percentage: number;
}

const CONTINGENCY_PLANS: Record<string, string[]> = {
  'Lluvias Torrenciales': [
    'Limpiar canales de drenaje y desagües',
    'Verificar estado de tuberías de riego',
    'Cerrar compuertas de entrada de agua en riego',
    'Inspeccionar estructuras de protección de plantas',
    'Asegurar equipos agrícolas expuestos',
  ],
  'Granizo': [
    'Cubrir plantas delicadas con malla protectora',
    'Verificar sistemas de amortiguación en invernaderos',
    'Prepara cuarentena para plantas dañadas',
    'Revisar el estado de techumbres y estructuras',
  ],
  'Rachas de Viento': [
    'Asegurar estructuras de invernadero',
    'Verificar anclajes de riego por aspersión',
    'Proteger plantas jóvenes con tutores',
    'Revisar malla de sombreo y soportes',
  ],
  'Ola de Calor': [
    'Aumentar frecuencia y duración de riego',
    'Instalar sistemas de refrigeración por aspersión',
    'Aplicar mulch para retención de humedad',
    'Verificar tanques de agua disponible',
    'Monitorear estrés hídrico de plantas',
  ],
  'Extremo Incendio': [
    'Crear cortafuegos alrededor de la finca',
    'Humedecer vegetación seca periféricamente',
    'Verificar tanques de agua y bombas de presión',
    'Limpiar maleza y vegetación muerta',
    'Preparar elementos de extinción portátiles',
    'Informar a bomberos sobre ubicación exacta',
  ],
};

interface Props {
  selectedFarm: Farm | undefined;
  onShowAlert?: (message: string) => void;
}

export default function AemetAlertsSection({ selectedFarm, onShowAlert }: Props) {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [fireRisk, setFireRisk] = useState<FireRisk>({ level: 'Bajo', percentage: 20 });
  const [checkedTasks, setCheckedTasks] = useState<string[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchWeatherAlerts();
  }, [selectedFarm]);

  const fetchWeatherAlerts = async () => {
    if (!selectedFarm?.latitud || !selectedFarm?.longitud) return;

    setLoading(true);
    try {
      // Simulate AEMET API call - in production use real AEMET API
      const simulatedAlerts: Alert[] = [];
      const randomAlert = Math.random();

      if (randomAlert < 0.3) {
        simulatedAlerts.push({
          type: 'Lluvias Torrenciales',
          level: 'warning',
          description: 'Se prevé lluvia intensa en las próximas 24 horas con posible precipitación acumulada >20mm',
          period: '12:00 a 20:00 UTC',
          icon: 'fa-cloud-showers-heavy',
        });
      } else if (randomAlert < 0.6) {
        simulatedAlerts.push({
          type: 'Ola de Calor',
          level: 'critical',
          description: 'Temperaturas extremas previstas. Riesgo muy alto de estrés hídrico en cultivos',
          period: '13:00 a 19:00 UTC',
          icon: 'fa-thermometer-full',
        });
      }

      setAlerts(simulatedAlerts);

      const riskLevel = Math.random();
      if (riskLevel > 0.8) {
        setFireRisk({ level: 'Extremo', percentage: 95 });
        if (onShowAlert) {
          onShowAlert('ALERTA MÁXIMA: Riesgo extremo de incendios. Prepárate y asegura la finca.');
        }
      } else if (riskLevel > 0.6) {
        setFireRisk({ level: 'Muy Alto', percentage: 75 });
      } else if (riskLevel > 0.4) {
        setFireRisk({ level: 'Alto', percentage: 55 });
      } else if (riskLevel > 0.2) {
        setFireRisk({ level: 'Moderado', percentage: 35 });
      } else {
        setFireRisk({ level: 'Bajo', percentage: 15 });
      }
    } catch (error) {
      console.error('Error fetching weather alerts:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRiskColor = (level: string) => {
    switch (level) {
      case 'Bajo':
        return '#10b981';
      case 'Moderado':
        return '#f59e0b';
      case 'Alto':
        return '#f97316';
      case 'Muy Alto':
        return '#ef4444';
      case 'Extremo':
        return '#7c2d12';
      default:
        return '#6b7280';
    }
  };

  const getAlertBgColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'bg-blue-50';
      case 'warning':
        return 'bg-yellow-50';
      case 'critical':
        return 'bg-red-50';
      default:
        return 'bg-gray-50';
    }
  };

  const getAlertBorderColor = (level: string) => {
    switch (level) {
      case 'info':
        return 'border-blue-200 text-blue-800';
      case 'warning':
        return 'border-yellow-200 text-yellow-800';
      case 'critical':
        return 'border-red-200 text-red-800';
      default:
        return 'border-gray-200 text-gray-800';
    }
  };

  const getGlobalBannerColor = () => {
    if (fireRisk.level === 'Extremo' || alerts.some(a => a.level === 'critical')) {
      return 'bg-red-600';
    }
    if (fireRisk.level === 'Muy Alto' || alerts.some(a => a.level === 'warning')) {
      return 'bg-yellow-600';
    }
    return 'bg-green-600';
  };

  const getGlobalMessage = () => {
    if (fireRisk.level === 'Extremo') {
      return '¡Cuidado que va a caer la mundial! Prepárate y asegura la finca cuanto antes';
    }
    if (alerts.some(a => a.level === 'critical')) {
      return 'Alerta crítica activa. Revisa tu plan de contingencia inmediatamente';
    }
    if (fireRisk.level === 'Muy Alto' || alerts.some(a => a.level === 'warning')) {
      return 'Alerta meteorológica: Condiciones adversas previstas. Monitorea la situación';
    }
    return 'Zona segura. Condiciones meteorológicas normales.';
  };

  return (
    <div>
      {/* Global banner */}
      <div className={`${getGlobalBannerColor()} text-white p-4 rounded-xl mb-6 shadow-lg transition-colors`}>
        <div className="flex items-center gap-3">
          <i className={`fas ${fireRisk.level === 'Extremo' ? 'fa-exclamation-triangle text-2xl animate-pulse' : fireRisk.level === 'Muy Alto' ? 'fa-exclamation-circle text-xl' : 'fa-check-circle text-xl'}`} />
          <div>
            <p className="font-bold text-lg">{getGlobalMessage()}</p>
            <p className="text-sm opacity-90">Finca: {selectedFarm?.nombre || 'No seleccionada'}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Weather Alerts Card */}
        <div className="lg:col-span-2">
          <div className="card bg-white p-6 border border-gray-100">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
              <i className="fas fa-cloud-sun text-yellow-600" /> Avisos Meteorológicos
            </h3>

            {loading && <p className="text-gray-500 italic">Cargando información meteorológica...</p>}

            {!loading && alerts.length === 0 && (
              <div className="text-center py-8">
                <i className="fas fa-sun text-4xl text-green-600 mb-3 opacity-30" />
                <p className="text-gray-600 font-semibold">Zona Segura</p>
                <p className="text-sm text-gray-500">No hay avisos meteorológicos activos</p>
              </div>
            )}

            {alerts.map((alert, i) => (
              <div key={i} className={`${getAlertBgColor(alert.level)} border-l-4 p-4 mb-4 rounded ${getAlertBorderColor(alert.level)}`}>
                <div className="flex items-start gap-3">
                  <i className={`fas ${alert.icon} text-xl mt-1 flex-shrink-0`} />
                  <div className="flex-1">
                    <p className="font-bold">{alert.type}</p>
                    <p className="text-sm mt-1">{alert.description}</p>
                    <p className="text-xs opacity-75 mt-2">Período: {alert.period}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedPlan(alert.type)}
                  className="mt-3 text-sm font-semibold hover:underline"
                >
                  Ver plan de contingencia →
                </button>
              </div>
            ))}

            <button
              onClick={fetchWeatherAlerts}
              className="w-full mt-4 py-2 border-2 border-gray-300 hover:border-gray-400 rounded-lg font-semibold transition-colors"
            >
              <i className="fas fa-refresh mr-2" /> Actualizar Estado
            </button>
          </div>
        </div>

        {/* Fire Risk Card */}
        <div className="card bg-white p-6 border border-gray-100">
          <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
            <i className="fas fa-fire text-red-600" /> Riesgo de Incendios
          </h3>

          <div className="mb-6">
            <div className="text-center mb-4">
              <p className="text-sm font-semibold text-gray-600 uppercase">Nivel Actual</p>
              <p className="text-3xl font-black mt-2" style={{ color: getRiskColor(fireRisk.level) }}>
                {fireRisk.level}
              </p>
            </div>

            <div className="relative w-full h-3 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full transition-all duration-300"
                style={{
                  width: `${fireRisk.percentage}%`,
                  backgroundColor: getRiskColor(fireRisk.level),
                }}
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">{fireRisk.percentage}% de riesgo</p>
          </div>

          <div className="space-y-2 text-sm">
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#10b981' }} />
              <span className="text-gray-600">Bajo: &lt;25%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#f59e0b' }} />
              <span className="text-gray-600">Moderado: 25-50%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#ef4444' }} />
              <span className="text-gray-600">Alto: 50-75%</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="inline-block w-3 h-3 rounded-full" style={{ backgroundColor: '#7c2d12' }} />
              <span className="text-gray-600">Extremo: &gt;75%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Contingency Plans */}
      {selectedPlan && CONTINGENCY_PLANS[selectedPlan] && (
        <div className="card bg-emerald-50 border-2 border-emerald-200 p-6">
          <div className="flex justify-between items-start mb-4">
            <h3 className="text-lg font-bold text-emerald-800">
              Plan de Contingencia: {selectedPlan}
            </h3>
            <button
              onClick={() => setSelectedPlan(null)}
              className="text-emerald-600 hover:text-emerald-800 font-bold"
            >
              <i className="fas fa-times text-xl" />
            </button>
          </div>

          <p className="text-sm text-emerald-700 mb-4">Acciones recomendadas para minimizar el impacto:</p>

          <div className="space-y-2">
            {CONTINGENCY_PLANS[selectedPlan].map((task, i) => (
              <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-emerald-100">
                <input
                  type="checkbox"
                  checked={checkedTasks.includes(`${selectedPlan}-${i}`)}
                  onChange={e => {
                    const taskId = `${selectedPlan}-${i}`;
                    setCheckedTasks(e.target.checked
                      ? [...checkedTasks, taskId]
                      : checkedTasks.filter(t => t !== taskId)
                    );
                  }}
                  className="w-5 h-5 text-emerald-600 rounded cursor-pointer"
                />
                <label className={`flex-1 text-sm cursor-pointer ${checkedTasks.includes(`${selectedPlan}-${i}`) ? 'line-through text-gray-400' : 'text-gray-700'}`}>
                  {task}
                </label>
              </div>
            ))}
          </div>

          <p className="text-xs text-emerald-600 mt-4 font-semibold">
            {checkedTasks.filter(t => t.startsWith(selectedPlan)).length} de {CONTINGENCY_PLANS[selectedPlan].length} tareas completadas
          </p>
        </div>
      )}
    </div>
  );
}

import { useState, useEffect, useCallback, useRef } from 'react';
import AuthScreen from './components/AuthScreen';
import Sidebar from './components/Sidebar';
import DashboardSection from './components/sections/DashboardSection';
import AdvancedStatisticsSection from './components/sections/AdvancedStatisticsSection';
import MapSection from './components/sections/MapSection';
import WeatherSection from './components/sections/WeatherSection';
import PestSection from './components/sections/PestSection';
import AboutSection from './components/sections/AboutSection';
import AemetAlertsSection from './components/sections/AemetAlertsSection';
import CropGuideModal from './components/CropGuideModal';
import type { Farm, CustomSensor, SensorData, ActiveSection } from './types';
import { supabase, getFarms, saveParcelas, addSensorData, signOut, addAgriculturalData } from './services/supabase';

function generateSensorData(): SensorData {
  const baseHumedad = Math.random() < 0.2 ? (15 + Math.random() * 14) : (35 + Math.random() * 50);
  return {
    temperatura: (21 + Math.random() * 8).toFixed(1),
    humedad: Math.floor(baseHumedad),
    ph: (6.0 + Math.random() * 2).toFixed(1),
    iluminacion: Math.floor(700 + Math.random() * 600),
  };
}

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userId, setUserId] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [activeSection, setActiveSection] = useState<ActiveSection>('dashboard');
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [selectedFarmId, setSelectedFarmId] = useState<string>('');
  const [customSensors, setCustomSensors] = useState<CustomSensor[]>([]);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [sessionHistory, setSessionHistory] = useState<SensorData[]>([]);
  const [showCropGuide, setShowCropGuide] = useState(false);
  const [refreshRate, setRefreshRate] = useState(30000);
  const [alertMessage, setAlertMessage] = useState('');
  const refreshIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const hourlyIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
  const userString = localStorage.getItem('osiris_user');
  if (userString) {
    const user = JSON.parse(userString);
    setUserId(user.id);
    setUserEmail(user.email);
    setIsLoggedIn(true);
    loadUserFarms(user.id);
  }
};

  const loadUserFarms = async (uid: string) => {
    const { data, error } = await getFarms(uid);
    if (!error && data) {
      setFarms(data as Farm[]);
      if (data.length > 0) {
        setSelectedFarmId(data[0].id as string);
      }
    }
  };

  const handleLoginSuccess = async (uid: string, email: string) => {
    setUserId(uid);
    setUserEmail(email);
    setIsLoggedIn(true);
    await loadUserFarms(uid);
  };

  const handleLogout = async () => {
    await signOut();
    setIsLoggedIn(false);
    setUserId('');
    setUserEmail('');
    setFarms([]);
    setSelectedFarmId('');
    setSensorData(null);
    setSessionHistory([]);
    if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
  };

  const handleAddFarm = async (name: string, hectares: number, cultivo: string, sector: string) => {
  const { error } = await saveParcelas([{
    usuario_id: userId,
    nombre: name,
    hectareas: hectares,
    cultivo: cultivo,
    sector: sector,
    latitud: null,
    longitud: null
  }]);

  if (error) {
    alert('❌ Error al guardar la finca: ' + error);
  } else {
    await loadUserFarms(userId);
  }
};

  const handleSensorUpdate = useCallback((data: SensorData) => {
  setSensorData(data);
  setSessionHistory(prev => {
    const next = [...prev, data];
    return next.length > 10 ? next.slice(-10) : next;
  });

  // DESACTIVADO - tabla datos_sensores no existe en Supabase
  // if (selectedFarmId) {
  //   addSensorData(selectedFarmId, ...).catch(console.error);
  // }
}, [selectedFarmId]);

  const generateAgriculturalData = useCallback(() => {
    return {
      temperatura_promedio: 18 + Math.random() * 12,
      humedad_promedio: 40 + Math.random() * 40,
      flujo_riego: Math.random() * 5,
      humedad_radiacion: 300 + Math.random() * 400,
      grados_dias: 15 + Math.random() * 10,
      velocidad_viento: Math.random() * 15,
      presion_atmosferica: 1013 + Math.random() * 10,
      velocidad_infiltracion: 5 + Math.random() * 5,
      precipitacion: Math.random() > 0.8 ? Math.random() * 10 : 0,
      velocidad_humedad: -2 + Math.random() * 4,
      radiacion_uva: 10 + Math.random() * 20,
      radiacion_infrarroja: 50 + Math.random() * 50,
      evapotranspiracion: 3 + Math.random() * 2,
      humedad_relativa: 45 + Math.random() * 35,
      temperatura_minima: 12 + Math.random() * 8,
      temperatura_maxima: 25 + Math.random() * 10,
      radiacion_neta: 200 + Math.random() * 400,
      velocidad_lluvia: Math.random() > 0.85 ? Math.random() * 5 : 0,
      humedad_hoja: 60 + Math.random() * 30,
      humedad_raiz: 35 + Math.random() * 30,
    };
  }, []);

  const simulate = useCallback(() => {
    const newSensorData = generateSensorData();
    handleSensorUpdate(newSensorData);

    // Guardar en BD al pulsar "Simular Datos"
    if (selectedFarmId) {
      const agData = {
        ...generateAgriculturalData(),
        humedad_suelo:        newSensorData.humedad,
        temperatura_ambiente: parseFloat(newSensorData.temperatura),
        nivel_ph:             parseFloat(newSensorData.ph),
        intensidad_luminica:  newSensorData.iluminacion,
      };
      addAgriculturalData(selectedFarmId, agData).catch(console.error);
    }
  }, [handleSensorUpdate, selectedFarmId, generateAgriculturalData]);

  const simulateHourlyData = useCallback(() => {
    if (!selectedFarmId) return;
    const agData = generateAgriculturalData();
    addAgriculturalData(selectedFarmId as string, agData).catch(console.error);
  }, [selectedFarmId, generateAgriculturalData]);

  useEffect(() => {
    if (!isLoggedIn) return;
    simulate();
    if (refreshRate > 0) {
      refreshIntervalRef.current = setInterval(simulate, refreshRate);
    }
    return () => {
      if (refreshIntervalRef.current) clearInterval(refreshIntervalRef.current);
    };
  }, [isLoggedIn, refreshRate, simulate]);

  useEffect(() => {
  if (!isLoggedIn || !selectedFarmId) return;

  // Guardar datos agrícolas automáticamente cada 5 minutos
  hourlyIntervalRef.current = setInterval(() => {
    simulateHourlyData();
  }, 5 * 60 * 1000);

  return () => {
    if (hourlyIntervalRef.current) clearInterval(hourlyIntervalRef.current);
  };
}, [isLoggedIn, selectedFarmId, simulateHourlyData]);

  if (!isLoggedIn) {
    return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
  }

  const selectedFarm = farms.find(f => f.id === selectedFarmId);

  return (
    <div className="min-h-screen bg-gray-100 flex" style={{ fontFamily: "'Roboto', sans-serif" }}>
      <Sidebar
        activeSection={activeSection}
        onNavigate={section => { setActiveSection(section); setSidebarOpen(false); }}
        userRole={userEmail}
        onLogout={handleLogout}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto bg-gray-100">
        <div className="p-4 md:p-6 lg:p-8 flex-grow flex flex-col">
          {/* Alert Toast */}
          {alertMessage && (
            <div className="mb-4 p-4 bg-red-600 text-white rounded-lg shadow-lg flex justify-between items-center">
              <div>
                <p className="font-bold"><i className="fas fa-exclamation-triangle mr-2" /> {alertMessage}</p>
              </div>
              <button onClick={() => setAlertMessage('')} className="hover:opacity-80">
                <i className="fas fa-times text-xl" />
              </button>
            </div>
          )}

          {/* Header */}
          <header className="flex items-center justify-between mb-8 bg-white/50 backdrop-blur-sm p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex items-center">
              <button
                className="md:hidden w-10 h-10 flex flex-col justify-center items-center text-green-800 hover:bg-green-50 rounded-xl mr-3 transition-colors shadow-sm border border-green-100 bg-white"
                onClick={() => setSidebarOpen(true)}
              >
                <i className="fas fa-bars text-lg" />
              </button>
            </div>
            <div className="flex items-center space-x-3 ml-auto">
              <button
                onClick={() => setShowCropGuide(true)}
                className="px-4 py-2 text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-xl text-sm font-semibold transition-colors border border-emerald-200 flex items-center gap-2 shadow-sm whitespace-nowrap"
              >
                <i className="fas fa-search text-emerald-600" />
                <span className="hidden sm:inline">Buscador de Cultivos</span>
              </button>
              <select
                value={refreshRate}
                onChange={e => setRefreshRate(Number(e.target.value))}
                className="text-xs font-bold bg-white border border-gray-200 rounded-xl px-3 py-2 outline-none focus:border-emerald-500 shadow-sm cursor-pointer"
              >
                <option value={10000}>10s</option>
                <option value={30000}>30s</option>
                <option value={60000}>1 min</option>
                <option value={300000}>5 min</option>
                <option value={0}>Manual</option>
              </select>
              <button
                onClick={simulate}
                className="w-10 h-10 flex items-center justify-center text-green-800 bg-white hover:bg-gray-50 border border-gray-200 rounded-xl shadow-sm transition-colors"
                title="Sincronizar Datos"
              >
                <i className="fas fa-sync-alt" />
              </button>
            </div>
          </header>

          {/* Sections */}
          <main className="flex-1">
            {activeSection === 'dashboard' && (
              <DashboardSection
                userRole={userEmail}
                farms={farms}
                selectedFarmId={selectedFarmId}
                onSelectFarm={setSelectedFarmId}
                onAddFarm={handleAddFarm}
                customSensors={customSensors}
                onAddSensor={() => {}}
                sensorData={sensorData}
                onSimulate={simulate}
                sessionHistory={sessionHistory}
              />
            )}
            {activeSection === 'parcela' && (
              <MapSection
                selectedFarm={selectedFarm}
                farms={farms}
                onSelectFarm={setSelectedFarmId}
                customSensors={customSensors}
              />
            )}
            {activeSection === 'estadisticas' && (
              <AdvancedStatisticsSection
                selectedFarm={selectedFarm}
                sessionHistory={sessionHistory}
                userRole={userEmail}
              />
            )}
            {activeSection === 'sensores' && <WeatherSection />}
            {activeSection === 'plagas' && <PestSection />}
            {activeSection === 'alertas' && (
              <AemetAlertsSection
                selectedFarm={selectedFarm}
                onShowAlert={setAlertMessage}
              />
            )}
            {activeSection === 'sobre-nosotros' && <AboutSection />}
            {activeSection === 'configuracion' && (
              <div className="card bg-white p-8 mb-8 text-center flex flex-col items-center justify-center min-h-[400px]">
                <i className="fas fa-cog text-5xl mb-4 text-gray-300" />
                <h2 className="text-2xl font-semibold text-green-800">Ajustes</h2>
                <p className="mt-2 text-gray-500">Esta sección aún no tiene contenido. Próximamente disponible.</p>
              </div>
            )}
          </main>

          <footer className="mt-8 pt-6 border-t border-gray-200 pb-6">
            <div className="text-center">
              <div className="inline-flex items-center gap-3 bg-white px-4 py-2 rounded-xl border border-gray-200 shadow-sm">
                <span className="text-xs font-bold text-gray-500">
                  <i className="fas fa-satellite-dish mr-1 text-emerald-500" />
                  {refreshRate > 0
                    ? `Actualizando cada ${refreshRate >= 60000 ? `${refreshRate / 60000} min` : `${refreshRate / 1000}s`}`
                    : 'Actualización manual'}
                </span>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Social buttons */}
      <div className="fixed bottom-6 left-6 z-[60] flex flex-col gap-4">
        <a href="https://www.youtube.com/@Osiris-11-zk3" target="_blank" rel="noopener noreferrer"
          className="w-14 h-14 bg-[#FF0000] rounded-full flex justify-center items-center text-white text-3xl shadow-lg hover:scale-110 transition-all">
          <i className="fab fa-youtube" />
        </a>
        <a href="https://www.tiktok.com/@osiris_oficial_11" target="_blank" rel="noopener noreferrer"
          className="w-14 h-14 bg-black rounded-full flex justify-center items-center text-white text-3xl shadow-lg hover:scale-110 transition-all">
          <i className="fab fa-tiktok" />
        </a>
        <a href="https://www.instagram.com/osirisoficcial" target="_blank" rel="noopener noreferrer"
          className="w-14 h-14 bg-gradient-to-tr from-yellow-400 via-red-500 to-pink-500 rounded-full flex justify-center items-center text-white text-3xl shadow-lg hover:scale-110 transition-all">
          <i className="fab fa-instagram" />
        </a>
      </div>

      {showCropGuide && <CropGuideModal onClose={() => setShowCropGuide(false)} 
        fincaId={selectedFarmId}
        />}
    </div>
  );
}

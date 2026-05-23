import { useState } from 'react';

interface WeatherData {
  temp: number;
  desc: string;
  icon: string;
  humidity: number;
  wind: number;
  maxTemp: number;
  minTemp: number;
  city: string;
}

function getWeatherInfo(code: number): { icon: string; desc: string } {
  if (code <= 1) return { icon: 'fas fa-sun text-yellow-300', desc: 'Despejado' };
  if (code <= 3) return { icon: 'fas fa-cloud-sun text-gray-200', desc: 'Nuboso' };
  if (code === 45 || code === 48) return { icon: 'fas fa-smog text-gray-300', desc: 'Niebla' };
  if ([51, 53, 55, 61, 63, 65].includes(code)) return { icon: 'fas fa-cloud-showers-heavy text-blue-200', desc: 'Lluvia' };
  if ([71, 73, 75].includes(code)) return { icon: 'fas fa-snowflake text-blue-100', desc: 'Nieve' };
  if ([95, 96, 99].includes(code)) return { icon: 'fas fa-bolt text-yellow-400', desc: 'Tormenta' };
  return { icon: 'fas fa-cloud text-gray-300', desc: 'Variable' };
}

export default function WeatherSection() {
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [lat, setLat] = useState('');
  const [lon, setLon] = useState('');

  const loadWeather = async (latitude: number, longitude: number) => {
    setLoading(true);
    setError('');
    try {
      const urlClima = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min&timezone=auto`;
      const urlNom = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=10&addressdetails=1`;

      const [resC, resN] = await Promise.allSettled([fetch(urlClima), fetch(urlNom, { headers: { 'User-Agent': 'OsirisApp/1.0', 'Accept-Language': 'es' } })]);

      if (resC.status === 'rejected' || !resC.value.ok) throw new Error('Error en API de clima');

      const dataClima = await resC.value.json();
      let city = 'Parcela Activa';
      if (resN.status === 'fulfilled' && resN.value.ok) {
        try {
          const dataN = await resN.value.json();
          city = dataN.address?.town || dataN.address?.city || dataN.address?.village || dataN.address?.municipality || dataN.address?.county || 'Parcela Activa';
        } catch { /* ignore */ }
      }

      const curr = dataClima.current;
      const daily = dataClima.daily;
      const wmo = getWeatherInfo(curr.weather_code);

      setWeather({
        temp: Math.round(curr.temperature_2m),
        desc: wmo.desc,
        icon: wmo.icon,
        humidity: curr.relative_humidity_2m,
        wind: curr.wind_speed_10m,
        maxTemp: Math.round(daily.temperature_2m_max[0]),
        minTemp: Math.round(daily.temperature_2m_min[0]),
        city,
      });
    } catch {
      setError('Error al cargar datos meteorológicos.');
    } finally {
      setLoading(false);
    }
  };

  const handleGPS = () => {
    if (!navigator.geolocation) { setError('Tu navegador no soporta geolocalización.'); return; }
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      pos => { loadWeather(pos.coords.latitude, pos.coords.longitude); },
      () => { setLoading(false); setError('Permiso GPS denegado. Introduce las coordenadas manualmente.'); },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const handleManual = () => {
    const numLat = parseFloat(lat.replace(',', '.'));
    const numLon = parseFloat(lon.replace(',', '.'));
    if (isNaN(numLat) || isNaN(numLon) || numLat < -90 || numLat > 90 || numLon < -180 || numLon > 180) {
      setError('Introduce coordenadas válidas (ej. Lat: 37.91, Lon: -4.72).');
      return;
    }
    loadWeather(numLat, numLon);
  };

  return (
    <div className="bg-white rounded-3xl shadow-sm p-4 md:p-8">
      <div className="flex flex-col items-center justify-between min-h-[300px] text-center border-t-4 border-green-800 pt-4">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Clima de la Parcela</h2>
        <p className="text-sm text-gray-500 mb-6">Obtén el pronóstico meteorológico exacto basado en tu geolocalización</p>

        <div className="w-full min-h-[200px] flex items-center justify-center bg-gray-50 rounded-2xl border border-gray-100 p-4 mb-6">
          {loading && (
            <div className="flex flex-col items-center justify-center p-8">
              <i className="fas fa-satellite-dish fa-spin text-green-800 text-3xl mb-3" />
              <p className="text-sm text-gray-600 font-medium">Obteniendo datos meteorológicos satelitales...</p>
            </div>
          )}
          {!loading && !weather && !error && (
            <p className="text-gray-400 italic text-sm">Haz clic en el botón inferior o introduce tus coordenadas para cargar el clima local.</p>
          )}
          {!loading && error && (
            <div className="p-6 text-center">
              <i className="fas fa-exclamation-triangle text-red-500 text-3xl mb-2" />
              <p className="text-red-500 font-medium">{error}</p>
            </div>
          )}
          {!loading && weather && (
            <div className="bg-gradient-to-br from-green-800 to-green-600 text-white rounded-2xl p-6 shadow-md w-full max-w-lg mx-auto">
              <div className="flex justify-between items-center mb-4 border-b border-white/20 pb-4">
                <div>
                  <h3 className="text-xl font-bold">{weather.city}</h3>
                  <p className="text-sm opacity-80 mt-1 capitalize">{weather.desc}</p>
                </div>
                <i className={`${weather.icon} text-5xl drop-shadow-md`} />
              </div>
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl font-black drop-shadow-sm">{weather.temp}°</div>
                <div className="text-right flex flex-col gap-1">
                  <span className="text-sm font-medium opacity-90"><i className="fas fa-arrow-up text-red-300 mr-1" /> Máx: {weather.maxTemp}°</span>
                  <span className="text-sm font-medium opacity-90"><i className="fas fa-arrow-down text-blue-300 mr-1" /> Mín: {weather.minTemp}°</span>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 mt-2 bg-white/10 rounded-xl p-3">
                <div className="flex items-center gap-3">
                  <i className="fas fa-tint opacity-70 text-lg" />
                  <div><p className="text-xs opacity-70 uppercase tracking-wider">Humedad</p><p className="font-bold text-sm">{weather.humidity}%</p></div>
                </div>
                <div className="flex items-center gap-3">
                  <i className="fas fa-wind opacity-70 text-lg" />
                  <div><p className="text-xs opacity-70 uppercase tracking-wider">Viento</p><p className="font-bold text-sm">{weather.wind} km/h</p></div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="w-full max-w-2xl mx-auto flex flex-col gap-4">
          <button onClick={handleGPS} disabled={loading}
            className="w-full py-3.5 bg-green-800 hover:bg-green-700 text-white font-bold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 text-base disabled:opacity-50">
            <i className="fas fa-map-marker-alt" /> Usar mi ubicación actual (GPS)
          </button>
          <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
            <p className="text-xs font-bold text-gray-600 mb-3 text-left uppercase tracking-wider">O introducir coordenadas manualmente</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <input type="text" value={lat} onChange={e => setLat(e.target.value)} placeholder="Latitud (ej. 37.91)"
                className="w-full text-sm p-3 border border-gray-200 rounded-lg outline-none focus:border-green-800 bg-white text-center font-medium" />
              <input type="text" value={lon} onChange={e => setLon(e.target.value)} placeholder="Longitud (ej. -4.72)"
                className="w-full text-sm p-3 border border-gray-200 rounded-lg outline-none focus:border-green-800 bg-white text-center font-medium" />
              <button onClick={handleManual} disabled={loading}
                className="w-full py-3 bg-gray-900 hover:bg-gray-800 text-white font-bold rounded-lg transition-colors text-sm shadow-sm disabled:opacity-50">
                Cargar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

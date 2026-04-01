import { useState, useEffect } from 'react';
import { Heart, Moon, Sun, LogOut, Bell, BellOff, User, Cloud, Utensils, Wind, Droplets, Thermometer, Search } from 'lucide-react';
import { supabase } from './lib/supabase';
import { useAuth } from './Hooks/useAuth';
import { useDarkMode } from './Hooks/useDarkMode';
import AuthPage from './components/AuthPage';
import ChartSection from './components/ChartSection';
import ExportPDF from './components/ExportPDF';
import type { BloodPressureLog } from './lib/supabase';

function getStatus(sys: number, dia: number): { label: string; color: string; bg: string; dbValue: string } {
  if (sys < 120 && dia < 80)
    return { label: '✅ Normal', color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/20', dbValue: 'Normal' };
  if (sys < 130 && dia < 80)
    return { label: '⚠️ Elevada', color: 'text-yellow-600', bg: 'bg-yellow-50 dark:bg-yellow-900/20', dbValue: 'Elevada' };
  if (sys < 140 || dia < 90)
    return { label: '🟠 Hipertensión I', color: 'text-orange-600', bg: 'bg-orange-50 dark:bg-orange-900/20', dbValue: 'Hipertensión' };
  return { label: '🔴 Hipertensión II', color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/20', dbValue: 'Hipertensión' };
}

// ─── CLIMA WIDGET ──────────────────────────────────────────────────────────────
function WeatherWidget({ darkMode }: { darkMode: boolean }) {
  const [weather, setWeather] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [city, setCity] = useState('');

  const fetchWeatherByCoords = async (lat: number, lon: number) => {
    try {
      setLoading(true);
      setError('');
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json`
      );
      const geoData = await geoRes.json();
      const cityName =
        geoData.address?.city ||
        geoData.address?.town ||
        geoData.address?.village ||
        'Tu ubicación';
      setCity(cityName);

      const res = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&timezone=auto`
      );
      const data = await res.json();
      setWeather({ ...data.current, city: cityName });
    } catch {
      setError('No se pudo obtener el clima');
    } finally {
      setLoading(false);
    }
  };

  const fetchWeatherByCity = async (cityInput: string) => {
    try {
      setLoading(true);
      setError('');
      const geoRes = await fetch(
        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(cityInput)}&format=json&limit=1`
      );
      const geoData = await geoRes.json();
      if (!geoData.length) throw new Error('Ciudad no encontrada');
      const { lat, lon } = geoData[0];
      await fetchWeatherByCoords(parseFloat(lat), parseFloat(lon));
      setCity(cityInput);
    } catch {
      setError('Ciudad no encontrada');
      setLoading(false);
    }
  };

  useEffect(() => {
    navigator.geolocation?.getCurrentPosition(
      (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => fetchWeatherByCity('Madrid')
    );
  }, []);

  const getWeatherDesc = (code: number) => {
    if (code === 0) return { text: 'Despejado', icon: '☀️' };
    if (code <= 3) return { text: 'Parcialmente nublado', icon: '⛅' };
    if (code <= 49) return { text: 'Niebla', icon: '🌫️' };
    if (code <= 69) return { text: 'Lluvia', icon: '🌧️' };
    if (code <= 79) return { text: 'Nieve', icon: '❄️' };
    if (code <= 99) return { text: 'Tormenta', icon: '⛈️' };
    return { text: 'Variable', icon: '🌤️' };
  };

  const [searchInput, setSearchInput] = useState('');

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900/40 rounded-xl flex items-center justify-center">
            <Cloud size={16} className="text-blue-500" />
          </div>
          <h2 className="text-lg font-bold text-gray-800 dark:text-white">Clima</h2>
        </div>
        {weather && (
          <span className="text-xs text-gray-400 dark:text-gray-500 font-medium">{weather.city}</span>
        )}
      </div>

      {/* Search bar */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && fetchWeatherByCity(searchInput)}
          placeholder="Buscar ciudad..."
          className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 
                     rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
        />
        <button
          onClick={() => fetchWeatherByCity(searchInput)}
          className="px-3 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-xl transition"
        >
          <Search size={14} />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {error && <p className="text-center text-sm text-red-400 py-4">{error}</p>}
      {weather && !loading && (
        <>
          <div className="text-center mb-4">
            <span className="text-5xl">{getWeatherDesc(weather.weather_code).icon}</span>
            <p className="text-4xl font-bold text-gray-800 dark:text-white mt-2">
              {Math.round(weather.temperature_2m)}°C
            </p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              {getWeatherDesc(weather.weather_code).text}
            </p>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
              <Droplets size={16} className="text-blue-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Humedad</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {weather.relative_humidity_2m}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3">
              <Wind size={16} className="text-blue-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Viento</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                  {Math.round(weather.wind_speed_10m)} km/h
                </p>
              </div>
            </div>
          </div>
          <p className="text-xs text-center text-gray-400 dark:text-gray-600 mt-3">
            💡 El clima frío puede elevar la presión arterial
          </p>
        </>
      )}
    </div>
  );
}

// ─── NUTRICIÓN WIDGET ──────────────────────────────────────────────────────────
function NutritionWidget() {
  const [query, setQuery] = useState('');
  const [product, setProduct] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const search = async () => {
    if (!query.trim()) return;
    setLoading(true);
    setError('');
    setProduct(null);
    try {
      const res = await fetch(
        `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=1&fields=product_name,nutriments,nutriscore_grade,brands`
      );
      const data = await res.json();
      if (data.products?.[0]) {
        setProduct(data.products[0]);
      } else {
        setError('Producto no encontrado');
      }
    } catch {
      setError('Error al buscar el producto');
    } finally {
      setLoading(false);
    }
  };

  const getNutriColor = (grade: string) => {
    const colors: Record<string, string> = {
      a: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      b: 'bg-lime-100 text-lime-700 dark:bg-lime-900/30 dark:text-lime-400',
      c: 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400',
      d: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-400',
      e: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
    };
    return colors[grade?.toLowerCase()] || 'bg-gray-100 text-gray-600';
  };

  const nutrients = product
    ? [
        { label: 'Calorías', value: product.nutriments?.['energy-kcal_100g'], unit: 'kcal', color: 'text-red-500' },
        { label: 'Sodio', value: product.nutriments?.sodium_100g != null ? (product.nutriments.sodium_100g * 1000).toFixed(0) : null, unit: 'mg', color: 'text-orange-500', warning: product.nutriments?.sodium_100g > 0.6 },
        { label: 'Grasas sat.', value: product.nutriments?.['saturated-fat_100g'], unit: 'g', color: 'text-yellow-500' },
        { label: 'Azúcares', value: product.nutriments?.sugars_100g, unit: 'g', color: 'text-pink-500' },
      ]
    : [];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-8 h-8 bg-green-100 dark:bg-green-900/40 rounded-xl flex items-center justify-center">
          <Utensils size={16} className="text-green-500" />
        </div>
        <h2 className="text-lg font-bold text-gray-800 dark:text-white">Nutrición</h2>
      </div>

      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && search()}
          placeholder="Busca un alimento..."
          className="flex-1 px-3 py-2 text-sm border border-gray-200 dark:border-gray-600 
                     rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white
                     focus:outline-none focus:ring-2 focus:ring-green-400 transition"
        />
        <button
          onClick={search}
          className="px-3 py-2 bg-green-500 hover:bg-green-600 text-white rounded-xl transition"
        >
          <Search size={14} />
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-6">
          <div className="w-6 h-6 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
        </div>
      )}
      {error && <p className="text-center text-sm text-red-400 py-4">{error}</p>}

      {!product && !loading && !error && (
        <div className="text-center py-4">
          <p className="text-sm text-gray-400 dark:text-gray-500">
            🥗 Busca un alimento para ver su info nutricional
          </p>
          <div className="flex flex-wrap gap-2 justify-center mt-3">
            {['Rice', 'Beff', 'Orange', 'Bread'].map(s => (
              <button
                key={s}
                onClick={() => { setQuery(s); }}
                className="text-xs px-3 py-1 bg-gray-100 dark:bg-gray-700 
                           text-gray-600 dark:text-gray-300 rounded-full hover:bg-green-100 
                           dark:hover:bg-green-900/30 hover:text-green-700 transition"
              >
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {product && !loading && (
        <>
          <div className="mb-4">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="font-bold text-gray-800 dark:text-white text-sm leading-tight">
                  {product.product_name || 'Producto sin nombre'}
                </p>
                {product.brands && (
                  <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">{product.brands}</p>
                )}
              </div>
              {product.nutriscore_grade && (
                <span className={`text-xs font-black px-2 py-1 rounded-lg uppercase shrink-0 ${getNutriColor(product.nutriscore_grade)}`}>
                  {product.nutriscore_grade}
                </span>
              )}
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">por 100g</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {nutrients.map(n => n.value != null && (
              <div key={n.label}
                className={`rounded-xl p-3 ${n.warning ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-700'}`}>
                <p className="text-xs text-gray-500 dark:text-gray-400">{n.label}</p>
                <p className={`text-sm font-bold ${n.warning ? 'text-red-500' : n.color}`}>
                  {typeof n.value === 'number' ? n.value.toFixed(1) : n.value} {n.unit}
                  {n.warning && ' ⚠️'}
                </p>
              </div>
            ))}
          </div>
          <p className="text-xs text-center text-gray-400 dark:text-gray-600 mt-3">
            💡 Reduce el sodio para mantener una presión saludable
          </p>
        </>
      )}
    </div>
  );
}

// ─── APP PRINCIPAL ─────────────────────────────────────────────────────────────
export default function App() {
  const { user, loading, signUp, signIn, signOut } = useAuth();
  const { darkMode, setDarkMode } = useDarkMode();
  const [logs, setLogs] = useState<BloodPressureLog[]>([]);
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [emailAlerts, setEmailAlerts] = useState(true);
  const [notification, setNotification] = useState('');

  useEffect(() => {
    if (user) fetchLogs();
  }, [user]);

  const fetchLogs = async () => {
    const { data, error } = await supabase
      .from('blood_pressure_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(100);
    if (!error && data) setLogs(data);
  };

  const showNotification = (msg: string) => {
    setNotification(msg);
    setTimeout(() => setNotification(''), 4000);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const sys = parseInt(systolic);
    const dia = parseInt(diastolic);
    const hr = parseInt(heartRate);
    const statusData = getStatus(sys, dia);
    const { error } = await supabase.from('blood_pressure_logs').insert({
      user_id: user?.id,
      systolic: sys,
      diastolic: dia,
      heart_rate: hr,
      status: statusData.dbValue,
    });
    if (!error) {
      setSystolic(''); setDiastolic(''); setHeartRate('');
      await fetchLogs();
      if (emailAlerts && sys >= 140) {
        showNotification(`🔔 Alerta: Presión alta detectada (${sys}/${dia}). Se notificará a tu médico.`);
      } else {
        showNotification('✅ Medición registrada correctamente');
      }
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-pink-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center">
        <div className="text-center">
          <Heart className="text-red-500 mx-auto mb-4 animate-pulse" size={48} fill="currentColor" />
          <p className="text-gray-600 dark:text-gray-300">Cargando VitalTrack...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className={darkMode ? 'dark' : ''}>
        <AuthPage onSignIn={signIn} onSignUp={signUp} />
      </div>
    );
  }

  const latest = logs[0];
  const latestStatus = latest ? getStatus(latest.systolic, latest.diastolic) : null;

  return (
    <div className={darkMode ? 'dark' : ''}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">

        {/* Toast */}
        {notification && (
          <div className="fixed top-4 right-4 z-50 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-2xl p-4 max-w-sm">
            <p className="text-sm text-gray-700 dark:text-gray-200">{notification}</p>
          </div>
        )}

        {/* Header */}
        <header className="bg-white dark:bg-gray-800 shadow-sm sticky top-0 z-40">
          <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Heart className="text-red-500" size={28} fill="currentColor" />
              <h1 className="text-xl font-bold text-gray-800 dark:text-white">VitalTrack</h1>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setEmailAlerts(!emailAlerts)}
                title={emailAlerts ? 'Alertas activas' : 'Alertas desactivadas'}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition"
              >
                {emailAlerts ? <Bell size={18} /> : <BellOff size={18} />}
              </button>
              <button
                onClick={() => setDarkMode(!darkMode)}
                className="p-2 rounded-xl bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 transition"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
                <User size={16} />
                <span className="hidden sm:block">{user.email}</span>
              </div>
              <button
                onClick={signOut}
                className="p-2 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-500 hover:bg-red-100 transition"
                title="Cerrar sesión"
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
        </header>

        <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">

          {/* ── FILA 1: Formulario + Última medición ── */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

            {/* Formulario (más ancho) */}
            <div className="lg:col-span-3 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-5">
                🩺 Nueva Medición
              </h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {[
                    { label: 'Sistólica (mmHg)', value: systolic, set: setSystolic, min: 60, max: 250, placeholder: 'ej. 120' },
                    { label: 'Diastólica (mmHg)', value: diastolic, set: setDiastolic, min: 40, max: 150, placeholder: 'ej. 80' },
                    { label: 'Ritmo Cardíaco (bpm)', value: heartRate, set: setHeartRate, min: 30, max: 220, placeholder: 'ej. 72' },
                  ].map(field => (
                    <div key={field.label}>
                      <label className="block text-sm font-semibold text-gray-600 dark:text-gray-300 mb-1">
                        {field.label}
                      </label>
                      <input
                        type="number"
                        value={field.value}
                        onChange={e => field.set(e.target.value)}
                        min={field.min}
                        max={field.max}
                        placeholder={field.placeholder}
                        required
                        className="w-full px-4 py-3 border border-gray-200 dark:border-gray-600 
                                   rounded-xl bg-gray-50 dark:bg-gray-700 dark:text-white
                                   focus:outline-none focus:ring-2 focus:ring-red-400 
                                   text-lg font-medium transition"
                      />
                    </div>
                  ))}
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full py-3 bg-gradient-to-r from-red-500 to-pink-500 
                             text-white font-bold rounded-xl shadow-lg 
                             hover:from-red-600 hover:to-pink-600 
                             disabled:opacity-60 transition-all transform hover:scale-[1.01]"
                >
                  {submitting ? '⏳ Guardando...' : '💾 Registrar Medición'}
                </button>
              </form>
            </div>

            {/* Última medición (más estrecho) */}
            {latest && latestStatus ? (
              <div className={`lg:col-span-2 rounded-2xl shadow-lg p-6 ${latestStatus.bg} flex flex-col justify-between`}>
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">
                  📊 Última Medición
                </h2>
                <div className="grid grid-cols-3 gap-2 text-center mb-4">
                  {[
                    { label: 'Sistólica', value: latest.systolic, unit: 'mmHg', color: 'text-red-500' },
                    { label: 'Diastólica', value: latest.diastolic, unit: 'mmHg', color: 'text-blue-500' },
                    { label: 'Cardíaco', value: latest.heart_rate, unit: 'bpm', color: 'text-green-500' },
                  ].map(item => (
                    <div key={item.label}>
                      <p className={`text-3xl font-bold ${item.color}`}>{item.value}</p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">{item.unit}</p>
                      <p className="text-xs font-medium text-gray-600 dark:text-gray-300 mt-1">{item.label}</p>
                    </div>
                  ))}
                </div>
                <div className="text-center">
                  <span className={`text-lg font-bold ${latestStatus.color}`}>{latestStatus.label}</span>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {new Date(latest.created_at).toLocaleString('es-ES')}
                  </p>
                </div>
              </div>
            ) : (
              <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 flex flex-col items-center justify-center text-center">
                <Heart className="text-red-300 mb-3" size={40} />
                <p className="text-gray-400 dark:text-gray-500 text-sm">
                  Aún no hay mediciones.<br />¡Registra la primera! 💪
                </p>
              </div>
            )}
          </div>

          {/* ── FILA 2: Gráfica ── */}
          <ChartSection logs={logs} darkMode={darkMode} />

          {/* ── FILA 3: Clima + Nutrición ── */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <WeatherWidget darkMode={darkMode} />
            <NutritionWidget />
          </div>

          {/* ── FILA 4: Historial + Exportar ── */}
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">
                📋 Historial ({logs.length} registros)
              </h2>
              <ExportPDF logs={logs} userName={user.email || 'Usuario'} />
            </div>
            <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
              {logs.length === 0 ? (
                <p className="text-center text-gray-400 dark:text-gray-500 py-8">
                  No hay registros aún. ¡Agrega tu primera medición! 💪
                </p>
              ) : (
                logs.map((log) => {
                  const s = getStatus(log.systolic, log.diastolic);
                  return (
                    <div key={log.id}
                      className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-xl">
                      <div className="flex gap-4 text-sm">
                        <span className="text-red-500 font-bold">{log.systolic}/{log.diastolic}</span>
                        <span className="text-green-500">{log.heart_rate} bpm</span>
                      </div>
                      <div className="text-right">
                        <span className={`text-xs font-medium ${s.color}`}>{s.label}</span>
                        <p className="text-xs text-gray-400 dark:text-gray-400">
                          {new Date(log.created_at).toLocaleDateString('es-ES')}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </main>        

        <footer className="text-center py-6 text-xs text-gray-400 dark:text-gray-600">
          VitalTrack • Cuida tu salud cada día ❤️
        </footer>
      </div>
    </div>
  );
}
import { useState, useEffect } from "react";
import {
  getWeatherByCoords,
  getWeatherDescription,
  getWeatherAdvice,
  searchFood,
  getHypertensionRating,
  getUserCoordinates,
  reverseGeocode,
} from "../services/apiServices";

// ════════════════════════════════════════════════════════
//  WIDGET — Clima (Open-Meteo + Nominatim)
// ════════════════════════════════════════════════════════
function WeatherWidget() {
  const [weather, setWeather] = useState(null);
  const [location, setLocation] = useState(null);
  const [advice, setAdvice] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const coords = await getUserCoordinates();
        const [loc, wthr] = await Promise.all([
          reverseGeocode(coords.lat, coords.lon),
          getWeatherByCoords(coords.lat, coords.lon),
        ]);
        setLocation(loc);
        setWeather(wthr);
        setAdvice(getWeatherAdvice(wthr.pressure, wthr.temperature));
      } catch (e) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.cardIcon}>🌤️</span>
        <div>
          <h3 style={styles.cardTitle}>Clima & Presión Atmosférica</h3>
          <p style={styles.cardSub}>Open-Meteo · Nominatim OSM</p>
        </div>
      </div>

      {loading && <LoadingSpinner label="Detectando ubicación..." />}
      {error && <ErrorBox msg={error} />}

      {weather && location && (
        <>
          <div style={styles.weatherMain}>
            <div style={styles.weatherBig}>
              <span style={{ fontSize: 48 }}>
                {getWeatherDescription(weather.weatherCode).split(" ")[0]}
              </span>
              <span style={styles.weatherTemp}>{weather.temperature}°C</span>
            </div>
            <div>
              <p style={styles.locationText}>
                📍 {location.city}, {location.state}
              </p>
              <p style={{ ...styles.badge, background: "#1e40af22", color: "#60a5fa" }}>
                {getWeatherDescription(weather.weatherCode)}
              </p>
            </div>
          </div>

          <div style={styles.weatherGrid}>
            <WeatherStat icon="💧" label="Humedad"     value={`${weather.humidity}%`} />
            <WeatherStat icon="🌬️" label="Viento"      value={`${weather.windSpeed} km/h`} />
            <WeatherStat icon="🌡️" label="Sensación"   value={`${weather.feelsLike}°C`} />
            <WeatherStat icon="📊" label="Presión atm." value={`${weather.pressure} hPa`} />
          </div>

          <div style={styles.adviceBox}>
            <p style={styles.adviceTitle}>💡 Impacto cardiovascular</p>
            {advice.map((a, i) => (
              <p key={i} style={styles.adviceItem}>{a}</p>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function WeatherStat({ icon, label, value }) {
  return (
    <div style={styles.weatherStat}>
      <span style={{ fontSize: 20 }}>{icon}</span>
      <p style={styles.weatherStatLabel}>{label}</p>
      <p style={styles.weatherStatValue}>{value}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  WIDGET — Nutrición (Spoonacular)
// ════════════════════════════════════════════════════════
function NutritionPanel() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [searched, setSearched] = useState(false);
  const [selected, setSelected] = useState(null);

  const quickSearches = ["manzana", "pollo", "arroz", "aguacate", "salmón", "huevo"];

  const handleSearch = async (term) => {
    const searchTerm = term || query;
    if (!searchTerm.trim()) return;
    setLoading(true);
    setError(null);
    setSearched(true);
    setSelected(null);
    try {
      const foods = await searchFood(searchTerm);
      setResults(foods.slice(0, 4));
    } catch {
      setError("No se pudo buscar el alimento.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.card}>
      <div style={styles.cardHeader}>
        <span style={styles.cardIcon}>🥗</span>
        <div>
          <h3 style={styles.cardTitle}>Nutrición & Presión Arterial</h3>
          <p style={styles.cardSub}>Spoonacular API</p>
        </div>
      </div>

      {/* Barra de búsqueda */}
      <div style={styles.searchBar}>
        <input
          style={styles.input}
          placeholder="Buscar alimento (ej: manzana, pollo, arroz...)"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <button style={styles.btnPrimary} onClick={() => handleSearch()}>
          Buscar
        </button>
      </div>

      {/* Búsquedas rápidas */}
      <div style={styles.chips}>
        {quickSearches.map((f) => (
          <button
            key={f}
            style={styles.chip}
            onClick={() => { setQuery(f); handleSearch(f); }}
          >
            {f}
          </button>
        ))}
      </div>

      {loading && <LoadingSpinner label="Analizando alimento..." />}
      {error && <ErrorBox msg={error} />}

      {/* Resultados */}
      {results.length > 0 && (
        <div style={styles.foodGrid}>
          {results.map((food, i) => {
            const rating = getHypertensionRating(food);
            return (
              <div
                key={i}
                style={{ ...styles.foodCard, borderLeft: `3px solid ${rating.color}`, cursor: "pointer" }}
                onClick={() => setSelected(selected?.id === food.id ? null : food)}
              >
                <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                  {food.image && (
                    <img src={food.image} alt={food.name} style={styles.foodImg} />
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={styles.foodName}>
                      {food.name.slice(0, 40)}{food.name.length > 40 ? "..." : ""}
                    </p>
                    <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 4 }}>
                      <span style={{ ...styles.badge, background: `${rating.color}22`, color: rating.color }}>
                        {rating.rating}
                      </span>
                    </div>
                  </div>
                </div>

                <div style={styles.foodStats}>
                  <FoodStat label="Calorías" value={`${Math.round(food.calories)} kcal`} />
                  <FoodStat label="Proteína"  value={`${food.protein?.toFixed(1) ?? "—"} g`} />
                  <FoodStat label="Carbos"    value={`${food.carbs?.toFixed(1) ?? "—"} g`} />
                  <FoodStat
                    label="Sodio"
                    value={`${Math.round(food.sodium_mg)} mg`}
                    warn={food.sodium_mg > 400}
                  />
                </div>

                {/* Detalle expandible */}
                {selected?.id === food.id && food.nutrients && (
                  <div style={styles.nutrientDetail}>
                    <p style={styles.adviceTitle}>📋 Nutrientes completos</p>
                    <div style={styles.nutrientGrid}>
                      {food.nutrients.map((n, j) => (
                        <div key={j} style={styles.nutrientItem}>
                          <p style={styles.foodStatLabel}>{n.name}</p>
                          <p style={styles.foodStatValue}>
                            {n.amount?.toFixed(1)} {n.unit}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {rating.reasons.length > 0 && (
                  <div style={{ marginTop: 6 }}>
                    {rating.reasons.map((r, j) => (
                      <p key={j} style={styles.reasonText}>{r}</p>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {searched && results.length === 0 && !loading && (
        <p style={styles.emptyText}>No se encontraron resultados.</p>
      )}
    </div>
  );
}

function FoodStat({ label, value, warn }) {
  return (
    <div style={styles.foodStatItem}>
      <p style={styles.foodStatLabel}>{label}</p>
      <p style={{ ...styles.foodStatValue, color: warn ? "#ef4444" : "#e2e8f0" }}>{value}</p>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  COMPONENTES DE UTILIDAD
// ════════════════════════════════════════════════════════
function LoadingSpinner({ label }) {
  return (
    <div style={styles.spinner}>
      <div style={styles.spinnerDot} />
      <p style={{ color: "#94a3b8", fontSize: 13 }}>{label}</p>
    </div>
  );
}

function ErrorBox({ msg }) {
  return (
    <div style={styles.errorBox}>⚠️ {msg}</div>
  );
}

// ════════════════════════════════════════════════════════
//  COMPONENTE PRINCIPAL — APIsPanel
// ════════════════════════════════════════════════════════
export default function APIsPanel() {
  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.sectionHeader}>
        <div>
          <h2 style={styles.sectionTitle}>🌐 Panel de APIs Externas</h2>
          <p style={styles.sectionSub}>3 fuentes de datos en tiempo real integradas en VitalTrack</p>
        </div>
        <div style={styles.apiBadges}>
          {["Open-Meteo", "Nominatim OSM", "Spoonacular"].map((api) => (
            <span key={api} style={styles.apiBadge}>✓ {api}</span>
          ))}
        </div>
      </div>

      {/* Grid de widgets */}
      <div style={styles.grid}>
        <WeatherWidget />
        <NutritionPanel />
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════
//  ESTILOS
// ════════════════════════════════════════════════════════
const styles = {
  container: {
    fontFamily: "'Inter', sans-serif",
    color: "#e2e8f0",
    padding: "24px",
    maxWidth: 1200,
    margin: "0 auto",
  },
  sectionHeader: {
    display: "flex", justifyContent: "space-between", alignItems: "flex-start",
    flexWrap: "wrap", gap: 16, marginBottom: 24,
    padding: "20px 24px",
    background: "linear-gradient(135deg, #0f172a, #1e293b)",
    borderRadius: 16,
    border: "1px solid #334155",
  },
  sectionTitle: { fontSize: 22, fontWeight: 700, margin: 0, color: "#f1f5f9" },
  sectionSub:   { fontSize: 13, color: "#94a3b8", margin: "4px 0 0" },
  apiBadges:    { display: "flex", flexWrap: "wrap", gap: 6 },
  apiBadge: {
    fontSize: 11, padding: "4px 10px",
    background: "#0ea5e922", color: "#38bdf8",
    borderRadius: 20, border: "1px solid #0ea5e944",
    fontWeight: 600,
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: 20,
  },
  card: {
    background: "#0f172a",
    border: "1px solid #1e293b",
    borderRadius: 16,
    padding: 20,
    boxSizing: "border-box",
  },
  cardHeader: { display: "flex", alignItems: "center", gap: 12, marginBottom: 16 },
  cardIcon:   { fontSize: 28 },
  cardTitle:  { fontSize: 16, fontWeight: 700, margin: 0, color: "#f1f5f9" },
  cardSub:    { fontSize: 11, color: "#64748b", margin: "2px 0 0", fontWeight: 500 },
  // Weather
  weatherMain: {
    display: "flex", alignItems: "center", gap: 16,
    padding: "16px", background: "#1e293b", borderRadius: 12, marginBottom: 16,
  },
  weatherBig:      { display: "flex", alignItems: "center", gap: 8 },
  weatherTemp:     { fontSize: 40, fontWeight: 800, color: "#f1f5f9" },
  locationText:    { fontSize: 14, color: "#94a3b8", margin: "0 0 6px" },
  weatherGrid:     { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 },
  weatherStat:     { background: "#1e293b", borderRadius: 10, padding: "10px 14px", textAlign: "center" },
  weatherStatLabel:{ fontSize: 11, color: "#64748b", margin: "4px 0 2px" },
  weatherStatValue:{ fontSize: 15, fontWeight: 700, color: "#f1f5f9", margin: 0 },
  adviceBox: {
    background: "#0c1220", border: "1px solid #1e3a5f",
    borderRadius: 10, padding: "12px 16px",
  },
  adviceTitle: { fontSize: 12, fontWeight: 700, color: "#60a5fa", margin: "0 0 8px" },
  adviceItem:  { fontSize: 13, color: "#cbd5e1", margin: "4px 0 0" },
  badge: {
    display: "inline-block", fontSize: 11, fontWeight: 600,
    padding: "2px 8px", borderRadius: 20,
  },
  // Search
  searchBar: { display: "flex", gap: 8, marginBottom: 10 },
  input: {
    flex: 1, background: "#1e293b", border: "1px solid #334155",
    borderRadius: 8, padding: "8px 14px", color: "#f1f5f9",
    fontSize: 14, outline: "none",
  },
  btnPrimary: {
    background: "linear-gradient(135deg, #3b82f6, #2563eb)",
    color: "#fff", border: "none", borderRadius: 8,
    padding: "8px 16px", cursor: "pointer", fontSize: 14,
    fontWeight: 600, whiteSpace: "nowrap",
  },
  chips: { display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 12 },
  chip: {
    background: "#1e293b", border: "1px solid #334155",
    color: "#94a3b8", borderRadius: 20, padding: "3px 10px",
    fontSize: 12, cursor: "pointer",
  },
  // Food
  foodGrid:      { display: "flex", flexDirection: "column", gap: 10, marginTop: 12 },
  foodCard:      { background: "#1e293b", borderRadius: 10, padding: "12px 14px" },
  foodImg:       { width: 48, height: 48, objectFit: "cover", borderRadius: 6 },
  foodName:      { fontSize: 13, fontWeight: 600, color: "#f1f5f9", margin: "0 0 2px", lineHeight: 1.3 },
  foodStats:     { display: "flex", gap: 16, marginTop: 10, flexWrap: "wrap" },
  foodStatItem:  { textAlign: "center" },
  foodStatLabel: { fontSize: 10, color: "#64748b", margin: 0 },
  foodStatValue: { fontSize: 13, fontWeight: 700, margin: "2px 0 0", color: "#e2e8f0" },
  reasonText:    { fontSize: 12, color: "#94a3b8", margin: "2px 0 0" },
  nutrientDetail:{ marginTop: 10, background: "#0f172a", borderRadius: 8, padding: "10px 12px" },
  nutrientGrid:  { display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 6, marginTop: 6 },
  nutrientItem:  { textAlign: "center" },
  // Utilities
  spinner:    { display: "flex", alignItems: "center", gap: 10, padding: "16px 0" },
  spinnerDot: {
    width: 20, height: 20, borderRadius: "50%",
    border: "2px solid #334155", borderTopColor: "#3b82f6",
    animation: "spin 0.8s linear infinite",
  },
  errorBox: {
    background: "#450a0a", border: "1px solid #7f1d1d",
    borderRadius: 8, padding: "10px 14px",
    fontSize: 13, color: "#fca5a5",
  },
  emptyText: { color: "#64748b", fontSize: 13, textAlign: "center", padding: "16px 0" },
};

// Spinner animation
const styleTag = document.createElement("style");
styleTag.innerHTML = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(styleTag);
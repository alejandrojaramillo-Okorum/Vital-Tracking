// src/services/apiServices.js
// ═══════════════════════════════════════════════
// 🌤️  OPEN-METEO — Clima sin API key
// ═══════════════════════════════════════════════
export const getWeatherByCoords = async (latitude, longitude) => {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,apparent_temperature,pressure_msl,wind_speed_10m,weather_code&timezone=auto`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error clima");
  const data = await res.json();
  const c = data.current;
  return {
    temperature: c.temperature_2m,
    humidity: c.relative_humidity_2m,
    feelsLike: c.apparent_temperature,
    pressure: c.pressure_msl,
    windSpeed: c.wind_speed_10m,
    weatherCode: c.weather_code,
  };
};

export const getWeatherDescription = (code) => {
  const map = {
    0: "☀️ Despejado", 1: "🌤️ Casi despejado", 2: "⛅ Parcial nublado",
    3: "☁️ Nublado", 45: "🌫️ Niebla", 51: "🌦️ Llovizna",
    61: "🌧️ Lluvia", 71: "🌨️ Nieve", 80: "🌩️ Chubascos", 95: "⛈️ Tormenta",
  };
  return map[code] || "🌡️ Variable";
};

export const getWeatherAdvice = (pressure, temperature) => {
  const tips = [];
  if (pressure < 1005) tips.push("⚠️ Presión atmosférica baja — monitoréate con más frecuencia hoy.");
  else if (pressure > 1020) tips.push("✅ Presión atmosférica estable — condiciones favorables.");
  if (temperature < 5) tips.push("🥶 Frío extremo — el frío eleva la presión arterial. Abrígate bien.");
  else if (temperature > 30) tips.push("🌡️ Calor intenso — hidrátate para evitar fluctuaciones de presión.");
  if (!tips.length) tips.push("✅ Clima sin alertas cardiovasculares hoy.");
  return tips;
};

// ═══════════════════════════════════════════════
// 💡 QUOTABLE API — Citas motivacionales
// ═══════════════════════════════════════════════
export const getHealthQuote = async () => {
  try {
    const tags = ["health", "life", "motivational", "inspirational"];
    const tag = tags[Math.floor(Math.random() * tags.length)];
    const res = await fetch(`https://api.quotable.io/random?tags=${tag}&maxLength=150`);
    if (!res.ok) throw new Error("Quotable no disponible");
    const data = await res.json();
    return { content: data.content, author: data.author };
  } catch {
    const fallback = [
      { content: "La salud es la mayor riqueza que puede poseer el hombre.", author: "Virgilio" },
      { content: "Cuida tu cuerpo. Es el único lugar que tienes para vivir.", author: "Jim Rohn" },
      { content: "Un cuerpo sano es el hogar de un alma sana.", author: "Francis Bacon" },
      { content: "La prevención es mejor que la cura.", author: "Erasmus" },
    ];
    return fallback[Math.floor(Math.random() * fallback.length)];
  }
};

// ═══════════════════════════════════════════════
// 🏥 OPEN FOOD FACTS — Nutrición
// ═══════════════════════════════════════════════
export const searchFood = async (query) => {
  const url = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(query)}&search_simple=1&action=process&json=1&page_size=5&fields=product_name,nutriments,nutrition_grades,image_small_url,brands`;
  const res = await fetch(url);
  if (!res.ok) throw new Error("Error alimento");
  const data = await res.json();
  return (data.products || []).map((p) => ({
    name: p.product_name || "Sin nombre",
    brand: p.brands || "—",
    grade: p.nutrition_grades?.toUpperCase() || "?",
    image: p.image_small_url || null,
    sodium_mg: (p.nutriments?.sodium_100g || 0) * 1000,
    potassium: p.nutriments?.potassium_100g || 0,
    calories: p.nutriments?.["energy-kcal_100g"] || 0,
    saturatedFat: p.nutriments?.["saturated-fat_100g"] || 0,
  }));
};

export const getHypertensionRating = (p) => {
  let score = 0;
  const reasons = [];
  if (p.sodium_mg > 600) { score -= 3; reasons.push("🔴 Alto en sodio"); }
  else if (p.sodium_mg < 120) { score += 2; reasons.push("🟢 Bajo en sodio"); }
  if (p.potassium > 0.3) { score += 2; reasons.push("🟢 Rico en potasio"); }
  if (p.saturatedFat > 5) { score -= 1; reasons.push("🟡 Alta grasa saturada"); }
  return {
    score,
    rating: score >= 2 ? "✅ Recomendado" : score >= 0 ? "⚠️ Moderado" : "❌ Evitar",
    color: score >= 2 ? "#22c55e" : score >= 0 ? "#f59e0b" : "#ef4444",
    reasons,
  };
};

// ═══════════════════════════════════════════════
// 💊 RXNORM (NIH) — Medicamentos
// ═══════════════════════════════════════════════
const RXNORM_BASE = "https://rxnav.nlm.nih.gov/REST";
const TTY_LABELS = {
  SBD: "Marca comercial", SCD: "Genérico", BN: "Nombre de marca",
  IN: "Ingrediente activo", MIN: "Multi-ingrediente",
};

export const searchMedication = async (query) => {
  const res = await fetch(`${RXNORM_BASE}/drugs.json?name=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error("Error medicamento");
  const data = await res.json();
  const groups = data.drugGroup?.conceptGroup || [];
  const results = [];
  for (const g of groups) {
    if (g.conceptProperties) {
      for (const c of g.conceptProperties) {
        results.push({
          rxcui: c.rxcui,
          name: c.name,
          typeLabel: TTY_LABELS[c.tty] || c.tty,
        });
      }
    }
  }
  return results.slice(0, 6);
};

export const COMMON_BP_MEDS = [
  "Lisinopril", "Amlodipine", "Losartan", "Metoprolol", "Enalapril", "Valsartan",
];

// ═══════════════════════════════════════════════
// 🗺️ NOMINATIM (OSM) — Geolocalización
// ═══════════════════════════════════════════════
export const getUserCoordinates = () =>
  new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocalización no soportada"));
    navigator.geolocation.getCurrentPosition(
      (p) => resolve({ lat: p.coords.latitude, lon: p.coords.longitude }),
      () => reject(new Error("Permiso denegado")),
      { timeout: 8000 }
    );
  });

export const reverseGeocode = async (lat, lon) => {
  const res = await fetch(
    `https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lon}&format=json&addressdetails=1`,
    { headers: { "Accept-Language": "es" } }
  );
  if (!res.ok) throw new Error("Error geocodificación");
  const data = await res.json();
  const a = data.address;
  return {
    city: a.city || a.town || a.village || a.county || "Ciudad desconocida",
    state: a.state || "",
    country: a.country || "",
    fullAddress: `${a.city || a.town || a.village || ""}, ${a.state || ""}, ${a.country || ""}`,
    lat,
    lon,
  };
};

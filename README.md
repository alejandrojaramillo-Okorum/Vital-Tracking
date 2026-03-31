# ❤️ VitalTrack — Monitoreo Inteligente de Presión Arterial

[![Open in Bolt](https://bolt.new/static/open-in-bolt.svg)](https://bolt.new/~/sb1-fjzksx5u)
![React](https://img.shields.io/badge/React-18-61DAFB?logo=react&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)
![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL-3ECF8E?logo=supabase&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-Build_Tool-646CFF?logo=vite&logoColor=white)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/License-MIT-green)

> **VitalTrack** es una aplicación web full-stack para el monitoreo continuo de presión arterial, 
> diseñada para pacientes con hipertensión. Integra 5 APIs externas en tiempo real, análisis 
> estadístico, exportación médica en PDF y una interfaz oscura completamente responsiva.

---

# 📋 Base de Datos — Supabase

### Tabla `profiles` — Usuarios del sistema
![Tabla profiles en Supabase](./screenshots/supabase-profiles.png)

> Almacena el perfil de cada usuario autenticado: nombre completo, email,
> preferencias de modo oscuro y alertas de correo electrónico.

---

### Tabla `blood_pressure_logs` — Historial de mediciones
![Tabla blood_pressure_logs en Supabase](./screenshots/supabase-logs.png)

> Registra cada medición del paciente con sistólica, diastólica, ritmo
> cardíaco, estado clínico calculado y timestamp con zona horaria.

---

# Stack Tecnológico

| Capa | Tecnología | Propósito |
|------|-----------|-----------|
| **Frontend** | React 18 + TypeScript | UI con tipado estricto |
| **Estilos** | Tailwind CSS | Diseño responsivo utility-first |
| **Build** | Vite | Bundler ultrarrápido |
| **Backend/DB** | Supabase (PostgreSQL) | Auth + base de datos en tiempo real |
| **Auth** | Supabase Auth | Login/Registro con JWT |
| **PDF Export** | Blob API nativa | Generación de reportes médicos |
| **Íconos** | Lucide React | Iconografía consistente |

---

# APIs Externas Integradas

| API | Proveedor | Uso en la app | Gratuita |
|-----|-----------|---------------|----------|
| **Open-Meteo** | Open-Meteo.com | Temperatura, humedad, presión atmosférica | ✅ |
| **Nominatim OSM** | OpenStreetMap | Geocodificación inversa (ciudad/estado) | ✅ |
| **Open Food Facts** | OFF Database | Datos nutricionales y Nutri-Score | ✅ |
---

# Estructura del Proyecto

```
vital-track/
├── public/
│   └── screenshots/           # Capturas para el README
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── LoginForm.tsx       # Formulario de inicio de sesión
│   │   │   └── RegisterForm.tsx    # Formulario de registro
│   │   ├── Dashboard/
│   │   │   ├── BPChart.tsx         # Gráfica de tendencia presión arterial
│   │   │   ├── BPLogger.tsx        # Formulario para registrar mediciones
│   │   │   ├── BPHistory.tsx       # Historial de registros con filtros
│   │   │   └── StatsCards.tsx      # Tarjetas de estadísticas (avg/min/max)
│   │   ├── APIsPanel.tsx           # Panel de APIs externas (clima, nutrición, meds)
│   │   ├── ExportPDF.tsx           # Exportador de reporte médico PDF
│   │   └── ui/
│   │       ├── LoadingSpinner.tsx
│   │       └── ErrorBox.tsx
│   ├── services/
│   │   └── apiServices.ts          # Todas las llamadas a APIs externas
│   ├── lib/
│   │   └── supabase.ts             # Cliente Supabase + tipos TypeScript
│   ├── hooks/
│   │   └── useBloodPressure.ts     # Hook personalizado para logs de PA
│   ├── App.tsx                     # Componente raíz + routing
│   └── main.tsx                    # Entry point
├── .env.example                    # Variables de entorno requeridas
├── tailwind.config.js
├── vite.config.ts
└── package.json
```

---

# Esquema de Base de Datos

### `profiles`
```sql
CREATE TABLE profiles (
  id          UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name   TEXT,
  email       TEXT,
  dark_mode   BOOLEAN DEFAULT FALSE,
  email_alerts BOOLEAN DEFAULT TRUE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

### `blood_pressure_logs`
```sql
CREATE TABLE blood_pressure_logs (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES profiles(id) ON DELETE CASCADE,
  systolic    INT4 NOT NULL,          -- Presión sistólica (mmHg)
  diastolic   INT4 NOT NULL,          -- Presión diastólica (mmHg)
  heart_rate  INT4,                   -- Ritmo cardíaco (bpm)
  status      TEXT,                   -- 'Normal' | 'Elevada' | 'Hipertensión'
  created_at  TIMESTAMPTZ DEFAULT NOW()
);
```

> **RLS activado:** Cada usuario solo puede ver y modificar sus propios registros.

---

## 📊 Clasificación Clínica (AHA/OMS)

| Categoría | Sistólica | | Diastólica | Color |
|-----------|-----------|--|-----------|-------|
| ✅ Normal | < 120 mmHg | Y | < 80 mmHg | Verde |
| ⚠️ Elevada | 120–129 mmHg | Y | < 80 mmHg | Amarillo |
| 🟠 HTA Grado 1 | 130–139 mmHg | O | 80–89 mmHg | Naranja |
| 🔴 HTA Grado 2 | ≥ 140 mmHg | O | ≥ 90 mmHg | Rojo |
| 🚨 Crisis Hipertensiva | ≥ 180 mmHg | O | ≥ 120 mmHg | Rojo oscuro |

---

## 📄 Exportación de Reporte PDF

El módulo `ExportPDF.tsx` genera un reporte médico completo directamente en el navegador, sin dependencias externas:

### Contenido del reporte:
- 🏥 **Encabezado** con logo, nombre del paciente y fecha
- 📊 **Estadísticas** — promedio, mínimo y máximo de SIS / DIA / FC
- 📈 **Gráfica SVG** — tendencia temporal de las lecturas
- 🥧 **Distribución** — porcentaje de lecturas por categoría clínica
- 🌡️ **Presión de pulso** — calculada por lectura (SIS − DIA)
- 🕐 **Franja horaria** — Mañana / Tarde / Noche / Madrugada
- 🚨 **Alertas críticas** — filas resaltadas para lecturas ≥ 180/120 mmHg
- 📋 **Tabla AHA/OMS** — clasificación de referencia oficial
- 💡 **Recomendaciones personalizadas** — basadas en el promedio real
- ⚠️ **Disclaimer médico legal**

```typescript
// Uso del componente
<ExportPDF
  logs={bloodPressureLogs}
  userName={currentUser.full_name}
/>
```

---

## 🌤️ Widget de Clima & Salud Cardiovascular

Detecta automáticamente la ubicación del usuario y muestra:

```typescript
// src/services/apiServices.ts
export const getWeatherByCoords = async (lat: number, lon: number) => {
  const res = await fetch(
    `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}
     &current=temperature_2m,relative_humidity_2m,apparent_temperature,
     weather_code,wind_speed_10m,surface_pressure`
  );
  // Retorna: { temperature, humidity, feelsLike, windSpeed, pressure, weatherCode }
};
```

- **Impacto cardiovascular** explicado según presión atmosférica y temperatura
- Presión > 1020 hPa → Riesgo de vasoconstricción
- Temperaturas extremas → Advertencia de esfuerzo cardíaco

---

## 🥗 Widget de Nutrición & Hipertensión

Busca alimentos y evalúa su impacto en la presión arterial:

```typescript
export const getHypertensionRating = (food: FoodItem) => {
  // Alto sodio (>400mg) → Perjudicial para HTA
  // Alto potasio       → Beneficioso (efecto vasodilatador)
  // Nutri-Score A/B    → Recomendado
  // Retorna: { rating, color, reasons[] }
};
```

---

## ⚡ Instalación y Configuración

### 1. Clonar el repositorio
```bash
git clone https://github.com/tu-usuario/vital-track.git
cd vital-track
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar variables de entorno
```bash
cp .env.example .env
```

```env
# .env
VITE_SUPABASE_URL=https://xxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here
```

### 4. Configurar Supabase

Ejecuta los siguientes scripts SQL en el **SQL Editor** de tu proyecto Supabase:

```sql
-- Crear tabla de perfiles
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  full_name TEXT,
  email TEXT,
  dark_mode BOOLEAN DEFAULT FALSE,
  email_alerts BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Crear tabla de registros de presión arterial
CREATE TABLE blood_pressure_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  systolic INT4 NOT NULL,
  diastolic INT4 NOT NULL,
  heart_rate INT4,
  status TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activar Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE blood_pressure_logs ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Users can manage own profile"
  ON profiles FOR ALL USING (auth.uid() = id);

CREATE POLICY "Users can manage own logs"
  ON blood_pressure_logs FOR ALL USING (auth.uid() = user_id);
```

### 5. Correr en desarrollo
```bash
npm run dev
```

### 6. Build de producción
```bash
npm run build
npm run preview
```

---

## Seguridad

- ✅ **Row Level Security (RLS)** activado en todas las tablas
- ✅ **JWT Tokens** manejados automáticamente por Supabase Auth
- ✅ **Variables de entorno** nunca expuestas en el cliente
- ✅ **CORS** configurado a nivel de Supabase
- ✅ **Sanitización** de inputs en todos los formularios

---

## Responsividad

| Breakpoint | Layout |
|-----------|--------|
| Mobile (< 640px) | Una columna, cards apiladas |
| Tablet (640–1024px) | Dos columnas en dashboard |
| Desktop (> 1024px) | Layout completo con sidebar |

---

## Scripts Disponibles

```bash
npm run dev        # Servidor de desarrollo (localhost:5173)
npm run build      # Build optimizado para producción
npm run preview    # Vista previa del build
npm run lint       # Verificación ESLint + TypeScript
```

---

## Contribuciones

1. Haz **fork** del repositorio
2. Crea una rama: `git checkout -b feature/nueva-funcionalidad`
3. Realiza tus cambios y commitea: `git commit -m 'feat: descripción'`
4. Sube la rama: `git push origin feature/nueva-funcionalidad`
5. Abre un **Pull Request**

---

## Disclaimer Médico

> VitalTrack es una herramienta de **monitoreo informativo** y **no reemplaza**
> el diagnóstico ni el tratamiento médico profesional. Siempre consulte a su
> médico o especialista en cardiología ante cualquier preocupación sobre su
> presión arterial o salud cardiovascular.

---

## Licencia

Este proyecto está bajo la licencia **MIT**.
Consulta el archivo [LICENSE](./LICENSE) para más detalles.

---

<div align="center">
  <p>Desarrollado con ❤️ para el bienestar cardiovascular</p>
  <p>
    <a href="https://bolt.new/~/sb1-fjzksx5u">
      <img src="https://bolt.new/static/open-in-bolt.svg" alt="Open in Bolt" />
    </a>
  </p>
</div>

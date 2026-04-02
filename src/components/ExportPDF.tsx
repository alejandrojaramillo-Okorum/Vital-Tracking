import { FileDown } from 'lucide-react';

export default function ExportPDF({ logs, userName }) {
  // ─── Helpers ────────────────────────────────────────────────
  const getStatus = (sys, dia) => {
    if (sys >= 180 || dia >= 120) return { label: 'Crisis Hipertensiva', cls: 'crisis' };
    if (sys >= 140 || dia >= 90)  return { label: 'Hipertensión Alta',   cls: 'high' };
    if (sys >= 130 || dia >= 80)  return { label: 'Hipertensión Etapa 1',cls: 'stage1' };
    if (sys >= 120)               return { label: 'Elevada',             cls: 'elevated' };
    return                               { label: 'Normal',              cls: 'normal' };
  };

  const getTimeSlot = (dateStr) => {
    const h = new Date(dateStr).getHours();
    if (h >= 6  && h < 12) return '🌅 Mañana';
    if (h >= 12 && h < 18) return '☀️ Tarde';
    if (h >= 18 && h < 22) return '🌆 Noche';
    return '🌙 Madrugada';
  };

  const avg = (arr) => arr.length ? Math.round(arr.reduce((s, v) => s + v, 0) / arr.length) : 0;

  // ─── Estadísticas ───────────────────────────────────────────
  const stats = {
    avgSys:    avg(logs.map(l => l.systolic)),
    avgDia:    avg(logs.map(l => l.diastolic)),
    avgHR:     avg(logs.map(l => l.heart_rate)),
    maxSys:    Math.max(...logs.map(l => l.systolic)),
    minSys:    Math.min(...logs.map(l => l.systolic)),
    maxDia:    Math.max(...logs.map(l => l.diastolic)),
    minDia:    Math.min(...logs.map(l => l.diastolic)),
    maxHR:     Math.max(...logs.map(l => l.heart_rate)),
    minHR:     Math.min(...logs.map(l => l.heart_rate)),
    crisis:    logs.filter(l => l.systolic >= 180 || l.diastolic >= 120).length,
    high:      logs.filter(l => (l.systolic >= 140 || l.diastolic >= 90) && l.systolic < 180 && l.diastolic < 120).length,
    stage1:    logs.filter(l => (l.systolic >= 130 || l.diastolic >= 80) && l.systolic < 140 && l.diastolic < 90).length,
    elevated:  logs.filter(l => l.systolic >= 120 && l.systolic < 130 && l.diastolic < 80).length,
    normal:    logs.filter(l => l.systolic < 120 && l.diastolic < 80).length,
  };

  // ─── Tendencia ──────────────────────────────────────────────
  const getTrend = () => {
    if (logs.length < 3) return { label: 'Datos insuficientes', icon: '—', color: '#64748b' };
    const mid   = Math.floor(logs.length / 2);
    const first = avg(logs.slice(0, mid).map(l => l.systolic));
    const last  = avg(logs.slice(mid).map(l => l.systolic));
    const diff  = first - last;
    if (diff > 5)  return { label: `Tendencia al alza (+${diff} mmHg)`,   icon: '↑', color: '#ef4444' };
    if (diff < -5) return { label: `Tendencia a la baja (${diff} mmHg)`, icon: '↓', color: '#22c55e' };
    return             { label: 'Tendencia estable',                      icon: '→', color: '#f59e0b' };
  };
  const trend = getTrend();

  // ─── Recomendaciones ────────────────────────────────────────
  const getRecommendations = () => {
    const recs = [];
    if (stats.avgSys >= 130 || stats.avgDia >= 80) {
      recs.push({ icon: '🏃', text: 'Realizar 30 minutos de actividad aeróbica moderada al menos 5 días a la semana (caminar, nadar, ciclismo).' });
      recs.push({ icon: '🧂', text: 'Reducir el consumo de sodio a menos de 2,300 mg/día. Evite alimentos procesados y enlatados.' });
      recs.push({ icon: '🥗', text: 'Adoptar la dieta DASH: rica en frutas, verduras, lácteos bajos en grasa y granos enteros.' });
      recs.push({ icon: '🚭', text: 'Evitar el tabaco y el alcohol. Ambos elevan significativamente la presión arterial.' });
    }
    if (stats.avgSys >= 140 || stats.avgDia >= 90) {
      recs.push({ icon: '💊', text: 'Consulte a su médico sobre la posibilidad de iniciar o ajustar tratamiento farmacológico antihipertensivo.' });
      recs.push({ icon: '📅', text: 'Programar visitas médicas cada 1-3 meses para monitoreo y ajuste de tratamiento.' });
    }
    if (stats.crisis > 0) {
      recs.push({ icon: '🚨', text: `Se detectaron ${stats.crisis} lectura(s) en rango de crisis hipertensiva (≥180/120 mmHg). Busque atención médica inmediata si ocurre nuevamente.` });
    }
    if (stats.avgHR > 100) {
      recs.push({ icon: '❤️', text: 'Frecuencia cardíaca promedio elevada (taquicardia). Consulte con su cardiólogo.' });
    }
    if (stats.avgHR < 60) {
      recs.push({ icon: '❤️', text: 'Frecuencia cardíaca promedio baja (bradicardia). Mencione esto en su próxima consulta médica.' });
    }
    recs.push({ icon: '😴', text: 'Dormir 7-8 horas diarias. La privación del sueño aumenta la presión arterial.' });
    recs.push({ icon: '🧘', text: 'Practicar técnicas de manejo del estrés: meditación, respiración profunda, yoga.' });
    recs.push({ icon: '⚖️', text: 'Mantener un peso saludable. Cada kg reducido puede bajar 1 mmHg la presión sistólica.' });
    recs.push({ icon: '💧', text: 'Mantenerse hidratado con agua. Limitar bebidas con cafeína y energizantes.' });
    return recs;
  };

  // ─── SVG Mini Chart ─────────────────────────────────────────
  const buildSVGChart = () => {
    if (logs.length < 2) return '';
    const W = 700, H = 120, PAD = 30;
    const sysVals = logs.map(l => l.systolic);
    const diaVals = logs.map(l => l.diastolic);
    const allVals = [...sysVals, ...diaVals];
    const minV = Math.min(...allVals) - 10;
    const maxV = Math.max(...allVals) + 10;
    const xStep = (W - PAD * 2) / (logs.length - 1);
    const yScale = (v) => H - PAD - ((v - minV) / (maxV - minV)) * (H - PAD * 2);
    const points = (vals) => vals.map((v, i) => `${PAD + i * xStep},${yScale(v)}`).join(' ');
    return `
      <svg viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg" style="width:100%;height:120px;margin-top:8px;">
        <rect width="${W}" height="${H}" fill="#fef2f2" rx="8"/>
        <text x="${PAD}" y="14" font-size="10" fill="#999">Sistólica</text>
        <text x="${PAD+80}" y="14" font-size="10" fill="#94a3b8">Diastólica</text>
        <line x1="${PAD-5}" y1="10" x2="${PAD+70}" y2="10" stroke="#ef4444" stroke-width="2"/>
        <line x1="${PAD+75}" y1="10" x2="${PAD+145}" y2="10" stroke="#94a3b8" stroke-width="2" stroke-dasharray="4,2"/>
        <polyline points="${points(sysVals)}" fill="none" stroke="#ef4444" stroke-width="2" stroke-linejoin="round"/>
        <polyline points="${points(diaVals)}" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-dasharray="4,2" stroke-linejoin="round"/>
        ${sysVals.map((v, i) => `<circle cx="${PAD + i * xStep}" cy="${yScale(v)}" r="3" fill="#ef4444"/>`).join('')}
        ${diaVals.map((v, i) => `<circle cx="${PAD + i * xStep}" cy="${yScale(v)}" r="2" fill="#94a3b8"/>`).join('')}
      </svg>`;
  };

  // ─── Generar HTML ────────────────────────────────────────────
  const handleExport = () => {
    const overallStatus = getStatus(stats.avgSys, stats.avgDia);
    const recommendations = getRecommendations();
    const totalPct = (n) => logs.length ? Math.round((n / logs.length) * 100) : 0;

    const printContent = `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <title>VitalTrack – Reporte Médico</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Source+Serif+4:wght@400;600;700&family=Inter:wght@400;500;600;700&display=swap');

    :root {
      --red:    #ef4444;
      --red-lt: #fef2f2;
      --green:  #16a34a;
      --amber:  #d97706;
      --orange: #ea580c;
      --crisis: #7f1d1d;
      --gray:   #64748b;
      --border: #e2e8f0;
      --text:   #1e293b;
    }

    * { margin:0; padding:0; box-sizing:border-box; }

    body {
      font-family: 'Inter', sans-serif;
      color: var(--text);
      background: #fff;
      font-size: 13px;
      line-height: 1.5;
    }

    /* ── PAGE SHELL ── */
    .page { padding: 32px 36px; max-width: 900px; margin: 0 auto; }

    /* ── HEADER ── */
    .header {
      display: flex; justify-content: space-between; align-items: flex-start;
      border-bottom: 3px solid var(--red); padding-bottom: 18px; margin-bottom: 24px;
    }
    .logo-group { display: flex; align-items: center; gap: 12px; }
    .logo-icon  { font-size: 36px; }
    .logo-text  { font-family: 'Source Serif 4', serif; font-size: 26px; font-weight: 700; color: var(--red); }
    .logo-sub   { font-size: 12px; color: var(--gray); margin-top: 2px; }
    .report-meta { text-align: right; }
    .report-id  { font-size: 11px; color: var(--gray); letter-spacing: .5px; }
    .report-date{ font-size: 12px; color: var(--text); font-weight: 600; margin-top: 4px; }

    /* ── PATIENT INFO ── */
    .patient-box {
      display: grid; grid-template-columns: 1fr 1fr 1fr;
      gap: 12px; background: var(--red-lt); border-radius: 10px;
      padding: 16px 20px; margin-bottom: 22px; border: 1px solid #fecaca;
    }
    .patient-field label { font-size: 10px; color: var(--gray); text-transform: uppercase; letter-spacing: .5px; display: block; }
    .patient-field span  { font-size: 14px; font-weight: 600; color: var(--text); }

    /* ── SECTION TITLE ── */
    .section-title {
      font-family: 'Source Serif 4', serif;
      font-size: 14px; font-weight: 700; color: var(--text);
      border-left: 4px solid var(--red); padding-left: 10px;
      margin: 20px 0 12px;
    }

    /* ── STATS GRID ── */
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 10px; margin-bottom: 20px; }
    .stat-card {
      border: 1px solid var(--border); border-radius: 10px;
      padding: 12px 14px; text-align: center;
    }
    .stat-card.accent { background: var(--red-lt); border-color: #fecaca; }
    .stat-label { font-size: 10px; color: var(--gray); text-transform: uppercase; letter-spacing: .4px; }
    .stat-value { font-size: 22px; font-weight: 700; color: var(--text); margin: 4px 0 2px; }
    .stat-sub   { font-size: 10px; color: var(--gray); }
    .stat-range { font-size: 11px; color: var(--gray); }

    /* ── OVERALL STATUS ── */
    .overall-box {
      display: flex; align-items: center; gap: 16px;
      border-radius: 10px; padding: 14px 20px; margin-bottom: 20px;
    }
    .overall-box.normal  { background: #f0fdf4; border: 1.5px solid #86efac; }
    .overall-box.elevated{ background: #fffbeb; border: 1.5px solid #fde68a; }
    .overall-box.stage1  { background: #fff7ed; border: 1.5px solid #fed7aa; }
    .overall-box.high    { background: #fef2f2; border: 1.5px solid #fecaca; }
    .overall-box.crisis  { background: #7f1d1d; border: 1.5px solid #dc2626; color: #fff; }
    .overall-icon { font-size: 32px; }
    .overall-label{ font-size: 13px; text-transform: uppercase; letter-spacing: .5px; opacity: .7; }
    .overall-status{ font-size: 20px; font-weight: 700; }
    .trend-badge {
      margin-left: auto; font-size: 13px; font-weight: 600;
      padding: 6px 14px; border-radius: 20px; background: #f1f5f9;
    }

    /* ── DISTRIBUTION BAR ── */
    .dist-bar { display: flex; height: 20px; border-radius: 10px; overflow: hidden; margin: 8px 0 14px; }
    .dist-seg { display: flex; align-items: center; justify-content: center; font-size: 10px; color: #fff; font-weight: 700; }
    .dist-legend { display: flex; flex-wrap: wrap; gap: 10px; font-size: 11px; color: var(--gray); }
    .dist-dot   { width: 10px; height: 10px; border-radius: 50%; display: inline-block; margin-right: 4px; vertical-align: middle; }

    /* ── TABLE ── */
    table { width: 100%; border-collapse: collapse; font-size: 12px; }
    thead th {
      background: var(--red); color: #fff; padding: 9px 10px;
      text-align: left; font-size: 11px; letter-spacing: .3px;
    }
    thead th:first-child { border-radius: 6px 0 0 0; }
    thead th:last-child  { border-radius: 0 6px 0 0; }
    tbody tr:nth-child(even) { background: #fafafa; }
    tbody tr:hover { background: var(--red-lt); }
    tbody td { padding: 8px 10px; border-bottom: 1px solid var(--border); }
    .status-badge {
      display: inline-block; padding: 2px 8px; border-radius: 12px;
      font-size: 10px; font-weight: 700;
    }
    .badge-normal  { background: #dcfce7; color: #15803d; }
    .badge-elevated{ background: #fef9c3; color: #a16207; }
    .badge-stage1  { background: #ffedd5; color: #c2410c; }
    .badge-high    { background: #fee2e2; color: #b91c1c; }
    .badge-crisis  { background: #7f1d1d; color: #fff; }
    .pp-low  { color: #16a34a; }
    .pp-high { color: #dc2626; }
    .alert-row { background: #fef2f2 !important; }
    .alert-row td { color: #7f1d1d; }

    /* ── AHA REFERENCE ── */
    .aha-table { width: 100%; border-collapse: collapse; font-size: 12px; margin-top: 10px; }
    .aha-table th { background: #1e293b; color: #fff; padding: 8px 12px; text-align: left; font-size: 11px; }
    .aha-table td { padding: 7px 12px; border-bottom: 1px solid var(--border); }
    .aha-table tr:nth-child(even) { background: #f8fafc; }

    /* ── RECOMMENDATIONS ── */
    .rec-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
    .rec-item {
      display: flex; gap: 10px; padding: 10px 12px;
      border: 1px solid var(--border); border-radius: 8px;
      background: #f8fafc; align-items: flex-start;
    }
    .rec-icon { font-size: 18px; flex-shrink: 0; margin-top: 1px; }
    .rec-text { font-size: 12px; color: #334155; line-height: 1.5; }

    /* ── DISCLAIMER ── */
    .disclaimer {
      margin-top: 20px;
      background: #fffbeb; border: 1px solid #fde68a;
      border-radius: 8px; padding: 12px 16px;
      font-size: 11px; color: #78350f; line-height: 1.6;
    }

    /* ── FOOTER ── */
    .footer {
      text-align: center; margin-top: 24px;
      border-top: 1px solid var(--border); padding-top: 14px;
      font-size: 11px; color: var(--gray);
    }

    /* ── PRINT ── */
    @media print {
      body { font-size: 12px; }
      .page { padding: 20px 24px; }
      .stats-grid { grid-template-columns: repeat(4, 1fr); }
      .page-break { page-break-before: always; }
      .no-print { display: none; }
    }
  </style>
</head>
<body>
<div class="page">

  <!-- HEADER -->
  <div class="header">
    <div class="logo-group">
      <div class="logo-icon">❤️</div>
      <div>
        <div class="logo-text">VitalTrack</div>
        <div class="logo-sub">Sistema de Monitoreo Cardiovascular</div>
      </div>
    </div>
    <div class="report-meta">
      <div class="report-id">REPORTE #${Math.random().toString(36).substring(2, 8).toUpperCase()}</div>
      <div class="report-date">${new Date().toLocaleDateString('es-ES', { weekday:'long', year:'numeric', month:'long', day:'numeric' })}</div>
      <div class="report-id" style="margin-top:4px">Generado: ${new Date().toLocaleTimeString('es-ES')}</div>
    </div>
  </div>

  <!-- PATIENT INFO -->
  <div class="patient-box">
    <div class="patient-field">
      <label>Paciente</label>
      <span>${userName}</span>
    </div>
    <div class="patient-field">
      <label>Total de Registros</label>
      <span>${logs.length} mediciones</span>
    </div>
    <div class="patient-field">
      <label>Período analizado</label>
      <span>${logs.length > 0 ? new Date(logs[logs.length-1].created_at).toLocaleDateString('es-ES') + ' – ' + new Date(logs[0].created_at).toLocaleDateString('es-ES') : '—'}</span>
    </div>
  </div>

  <!-- OVERALL STATUS -->
  <div class="section-title">📋 Diagnóstico General</div>
  <div class="overall-box ${overallStatus.cls}">
    <div class="overall-icon">${overallStatus.cls === 'normal' ? '✅' : overallStatus.cls === 'crisis' ? '🚨' : '⚠️'}</div>
    <div>
      <div class="overall-label">Estado promedio del paciente</div>
      <div class="overall-status">${overallStatus.label}</div>
    </div>
    <div class="trend-badge" style="color:${trend.color}">
      ${trend.icon} ${trend.label}
    </div>
  </div>

  <!-- STATS -->
  <div class="section-title">📊 Estadísticas Generales</div>
  <div class="stats-grid">
    <div class="stat-card accent">
      <div class="stat-label">Sistólica Promedio</div>
      <div class="stat-value">${stats.avgSys}</div>
      <div class="stat-sub">mmHg</div>
      <div class="stat-range">Min ${stats.minSys} · Max ${stats.maxSys}</div>
    </div>
    <div class="stat-card accent">
      <div class="stat-label">Diastólica Promedio</div>
      <div class="stat-value">${stats.avgDia}</div>
      <div class="stat-sub">mmHg</div>
      <div class="stat-range">Min ${stats.minDia} · Max ${stats.maxDia}</div>
    </div>
    <div class="stat-card">
      <div class="stat-label">Ritmo Cardíaco Prom.</div>
      <div class="stat-value">${stats.avgHR}</div>
      <div class="stat-sub">bpm</div>
      <div class="stat-range">Min ${stats.minHR} · Max ${stats.maxHR}</div>
    </div>
    <div class="stat-card" style="${stats.crisis > 0 ? 'border-color:#dc2626;background:#fef2f2' : ''}">
      <div class="stat-label">Lecturas en Crisis</div>
      <div class="stat-value" style="${stats.crisis > 0 ? 'color:#dc2626' : 'color:#16a34a'}">${stats.crisis}</div>
      <div class="stat-sub">de ${logs.length} total</div>
      <div class="stat-range">${stats.crisis > 0 ? '⚠️ Requiere atención' : '✓ Sin crisis'}</div>
    </div>
  </div>

  <!-- DISTRIBUTION -->
  <div class="section-title">📈 Distribución de Lecturas</div>
  <div class="dist-bar">
    ${stats.normal  > 0 ? `<div class="dist-seg" style="width:${totalPct(stats.normal)}%;background:#16a34a">${totalPct(stats.normal)}%</div>` : ''}
    ${stats.elevated> 0 ? `<div class="dist-seg" style="width:${totalPct(stats.elevated)}%;background:#ca8a04">${totalPct(stats.elevated)}%</div>` : ''}
    ${stats.stage1  > 0 ? `<div class="dist-seg" style="width:${totalPct(stats.stage1)}%;background:#ea580c">${totalPct(stats.stage1)}%</div>` : ''}
    ${stats.high    > 0 ? `<div class="dist-seg" style="width:${totalPct(stats.high)}%;background:#dc2626">${totalPct(stats.high)}%</div>` : ''}
    ${stats.crisis  > 0 ? `<div class="dist-seg" style="width:${totalPct(stats.crisis)}%;background:#7f1d1d">${totalPct(stats.crisis)}%</div>` : ''}
  </div>
  <div class="dist-legend">
    <span><span class="dist-dot" style="background:#16a34a"></span>Normal (${stats.normal})</span>
    <span><span class="dist-dot" style="background:#ca8a04"></span>Elevada (${stats.elevated})</span>
    <span><span class="dist-dot" style="background:#ea580c"></span>HTA Etapa 1 (${stats.stage1})</span>
    <span><span class="dist-dot" style="background:#dc2626"></span>HTA Alta (${stats.high})</span>
    <span><span class="dist-dot" style="background:#7f1d1d"></span>Crisis (${stats.crisis})</span>
  </div>

  <!-- CHART -->
  <div class="section-title">📉 Gráfica de Tendencia</div>
  ${buildSVGChart()}

  <!-- TABLE -->
  <div class="section-title page-break" style="margin-top:28px">📋 Historial Detallado de Mediciones</div>
  <table>
    <thead>
      <tr>
        <th>#</th>
        <th>Fecha y Hora</th>
        <th>Franja</th>
        <th>Sistólica</th>
        <th>Diastólica</th>
        <th>Ritmo C.</th>
        <th>Presión Pulso</th>
        <th>Estado</th>
      </tr>
    </thead>
    <tbody>
      ${logs.map((log, i) => {
        const st  = getStatus(log.systolic, log.diastolic);
        const pp  = log.systolic - log.diastolic;
        const ppCls = pp > 60 ? 'pp-high' : pp < 40 ? 'pp-low' : '';
        const isCrisis = log.systolic >= 180 || log.diastolic >= 120;
        return `
          <tr class="${isCrisis ? 'alert-row' : ''}">
            <td>${i + 1}</td>
            <td>${new Date(log.created_at).toLocaleString('es-ES')}</td>
            <td>${getTimeSlot(log.created_at)}</td>
            <td><strong>${log.systolic}</strong> mmHg</td>
            <td><strong>${log.diastolic}</strong> mmHg</td>
            <td>${log.heart_rate} bpm</td>
            <td class="${ppCls}"><strong>${pp}</strong> mmHg</td>
            <td><span class="status-badge badge-${st.cls}">${st.label}</span></td>
          </tr>`;
      }).join('')}
    </tbody>
  </table>

  <!-- AHA REFERENCE -->
  <div class="section-title page-break" style="margin-top:28px">📖 Clasificación AHA / OMS de Referencia</div>
  <table class="aha-table">
    <thead>
      <tr>
        <th>Categoría</th>
        <th>Sistólica (mmHg)</th>
        <th>Diastólica (mmHg)</th>
        <th>Acción Recomendada</th>
      </tr>
    </thead>
    <tbody>
      <tr><td>✅ Normal</td><td>&lt; 120</td><td>&lt; 80</td><td>Mantener hábitos saludables</td></tr>
      <tr><td>⚠️ Elevada</td><td>120 – 129</td><td>&lt; 80</td><td>Cambios en el estilo de vida</td></tr>
      <tr><td>🟠 HTA Etapa 1</td><td>130 – 139</td><td>80 – 89</td><td>Dieta, ejercicio, posible medicación</td></tr>
      <tr><td>🔴 HTA Etapa 2</td><td>≥ 140</td><td>≥ 90</td><td>Medicación + cambios de estilo de vida</td></tr>
      <tr><td>🚨 Crisis Hipertensiva</td><td>≥ 180</td><td>≥ 120</td><td>Atención médica inmediata</td></tr>
    </tbody>
  </table>

  <!-- RECOMMENDATIONS -->
  <div class="section-title" style="margin-top:28px">💡 Recomendaciones Personalizadas</div>
  <div class="rec-grid">
    ${recommendations.map(r => `
      <div class="rec-item">
        <div class="rec-icon">${r.icon}</div>
        <div class="rec-text">${r.text}</div>
      </div>`).join('')}
  </div>

  <!-- DISCLAIMER -->
  <div class="disclaimer">
    ⚠️ <strong>Aviso Médico Importante:</strong> Este reporte ha sido generado automáticamente por VitalTrack con fines informativos y de monitoreo personal. 
    <strong>No constituye un diagnóstico médico</strong> ni reemplaza la consulta con un profesional de la salud calificado. 
    Los valores y recomendaciones aquí incluidos son orientativos. Siempre consulte a su médico tratante para evaluación clínica, 
    diagnóstico y tratamiento apropiado. En caso de crisis hipertensiva (≥180/120 mmHg), diríjase inmediatamente a urgencias.
  </div>

  <!-- FOOTER -->
  <div class="footer">
    <strong>VitalTrack</strong> – Sistema de Monitoreo Cardiovascular &nbsp;•&nbsp;
    Reporte generado el ${new Date().toLocaleString('es-ES')} &nbsp;•&nbsp;
    Clasificación basada en guías AHA/ACC 2024
  </div>

</div>
<script>window.onload = () => window.print();</script>
</body>
</html>`;

    const blob      = new Blob([printContent], { type: 'text/html;charset=utf-8' });
    const url       = URL.createObjectURL(blob);
    const newWindow = window.open(url, '_blank');

    if (newWindow) {
      newWindow.onload = () => URL.revokeObjectURL(url);
    } else {
      const a      = document.createElement('a');
      a.href       = url;
      a.download   = `VitalTrack-Reporte-${userName.replace(/\s+/g,'-')}-${new Date().toISOString().split('T')[0]}.html`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={logs.length === 0}
      className="flex items-center gap-2 px-4 py-2 bg-red-500 hover:bg-red-600
                 text-white rounded-xl font-semibold shadow-lg transition-all
                 disabled:opacity-50 disabled:cursor-not-allowed
                 transform hover:scale-105 active:scale-95"
    >
      <FileDown size={18} />
      Exportar Reporte
    </button>
  );
}
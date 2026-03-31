import { useState } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, ResponsiveContainer, ReferenceLine
} from 'recharts';
import type { BloodPressureLog } from '../lib/supabase';

type Period = '7d' | '30d' | '90d' | 'all';

interface ChartSectionProps {
  logs: BloodPressureLog[];
  darkMode: boolean;
}

export default function ChartSection({ logs, darkMode }: ChartSectionProps) {
  const [period, setPeriod] = useState<Period>('7d');

  const filterByPeriod = (logs: BloodPressureLog[]) => {
    const now = new Date();
    const cutoff: Record<Period, Date> = {
      '7d': new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000),
      '90d': new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000),
      'all': new Date(0),
    };
    return logs
      .filter(l => new Date(l.created_at) >= cutoff[period])
      .map(l => ({
        fecha: new Date(l.created_at).toLocaleDateString('es-ES', { 
          month: 'short', day: 'numeric' 
        }),
        Sistólica: l.systolic,
        Diastólica: l.diastolic,
        'Ritmo Cardíaco': l.heart_rate,
      }))
      .reverse();
  };

  const data = filterByPeriod(logs);
  const axisColor = darkMode ? '#9ca3af' : '#6b7280';
  const gridColor = darkMode ? '#374151' : '#e5e7eb';

  const periods: { key: Period; label: string }[] = [
    { key: '7d', label: '7 días' },
    { key: '30d', label: '30 días' },
    { key: '90d', label: '90 días' },
    { key: 'all', label: 'Todo' },
  ];

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <h2 className="text-xl font-bold text-gray-800 dark:text-white">
          📈 Historial de Mediciones
        </h2>
        {/* Filtro de período */}
        <div className="flex gap-2">
          {periods.map(p => (
            <button
              key={p.key}
              onClick={() => setPeriod(p.key)}
              className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
                period === p.key
                  ? 'bg-red-500 text-white shadow'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {data.length === 0 ? (
        <div className="h-64 flex items-center justify-center text-gray-400 dark:text-gray-500">
          <div className="text-center">
            <p className="text-4xl mb-2">📊</p>
            <p>No hay datos para este período</p>
          </div>
        </div>
      ) : (
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={data} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} />
            <XAxis dataKey="fecha" tick={{ fill: axisColor, fontSize: 12 }} />
            <YAxis tick={{ fill: axisColor, fontSize: 12 }} domain={[40, 200]} />
            <Tooltip
              contentStyle={{
                backgroundColor: darkMode ? '#1f2937' : '#fff',
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
                color: darkMode ? '#f9fafb' : '#111827',
              }}
            />
            <Legend />
            {/* Línea de referencia para presión normal */}
            <ReferenceLine y={120} stroke="#ef4444" strokeDasharray="5 5" 
                          label={{ value: 'Límite Sistólica', fill: '#ef4444', fontSize: 10 }} />
            <ReferenceLine y={80} stroke="#f97316" strokeDasharray="5 5" 
                          label={{ value: 'Límite Diastólica', fill: '#f97316', fontSize: 10 }} />
            <Line type="monotone" dataKey="Sistólica" stroke="#ef4444" 
                  strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Diastólica" stroke="#3b82f6" 
                  strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
            <Line type="monotone" dataKey="Ritmo Cardíaco" stroke="#10b981" 
                  strokeWidth={2} dot={{ r: 4 }} activeDot={{ r: 6 }} />
          </LineChart>
        </ResponsiveContainer>
      )}

      {/* Estadísticas del período */}
      {data.length > 0 && (
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100 dark:border-gray-700">
          {[
            { label: 'Promedio Sistólica', value: Math.round(data.reduce((a, b) => a + b.Sistólica, 0) / data.length), unit: 'mmHg', color: 'text-red-500' },
            { label: 'Promedio Diastólica', value: Math.round(data.reduce((a, b) => a + b.Diastólica, 0) / data.length), unit: 'mmHg', color: 'text-blue-500' },
            { label: 'Promedio Ritmo', value: Math.round(data.reduce((a, b) => a + b['Ritmo Cardíaco'], 0) / data.length), unit: 'bpm', color: 'text-green-500' },
          ].map(stat => (
            <div key={stat.label} className="text-center">
              <p className={`text-2xl font-bold ${stat.color}`}>{stat.value}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{stat.unit}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{stat.label}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

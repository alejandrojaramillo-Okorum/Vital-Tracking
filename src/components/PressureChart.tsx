import React from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { TrendingUp } from 'lucide-react';
import { BloodPressureLog } from '../lib/supabaseClient';

interface PressureChartProps {
  data: BloodPressureLog[];
}

export function PressureChart({ data }: PressureChartProps) {
  const chartData = data
    .slice()
    .reverse()
    .map((log) => {
      const date = new Date(log.created_at);
      return {
        fecha: date.toLocaleDateString('es-ES', {
          day: '2-digit',
          month: '2-digit',
        }),
        Sistólica: log.systolic,
        Diastólica: log.diastolic,
      };
    });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <TrendingUp className="text-sky-500" size={24} />
          <span>Historial de Presión Arterial</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            No hay datos suficientes para mostrar el gráfico
          </p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="fecha" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="Sistólica"
                stroke="#0ea5e9"
                strokeWidth={2}
                dot={{ fill: '#0ea5e9' }}
              />
              <Line
                type="monotone"
                dataKey="Diastólica"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ fill: '#10b981' }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

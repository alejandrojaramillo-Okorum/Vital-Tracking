import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Heart } from 'lucide-react';
import { BloodPressureLog } from '../lib/supabaseClient';
import { getStatusColor } from '../utils/bloodPressureUtils';

interface LastMeasurementProps {
  measurement: BloodPressureLog | null;
}

export function LastMeasurement({ measurement }: LastMeasurementProps) {
  if (!measurement) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Heart className="text-sky-500" size={24} />
            <span>Última Medición</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500 text-center py-4">
            No hay mediciones registradas aún
          </p>
        </CardContent>
      </Card>
    );
  }

  const date = new Date(measurement.created_at);
  const formattedDate = date.toLocaleDateString('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const formattedTime = date.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Heart className="text-sky-500" size={24} />
          <span>Última Medición</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Fecha:</span>
            <span className="font-medium">{formattedDate} - {formattedTime}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Presión Arterial:</span>
            <span className="font-medium text-lg">
              {measurement.systolic}/{measurement.diastolic} mmHg
            </span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Ritmo Cardíaco:</span>
            <span className="font-medium">{measurement.heart_rate} bpm</span>
          </div>
          <div className="flex justify-between items-center pt-2 border-t border-gray-200">
            <span className="text-gray-600">Estado:</span>
            <span className={`font-bold text-lg ${getStatusColor(measurement.status)}`}>
              {measurement.status}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

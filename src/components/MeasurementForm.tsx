import React, { useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Input } from './ui/Input';
import { Button } from './ui/Button';
import { Activity } from 'lucide-react';

interface MeasurementFormProps {
  onSubmit: (data: { systolic: number; diastolic: number; heart_rate: number }) => Promise<void>;
}

export function MeasurementForm({ onSubmit }: MeasurementFormProps) {
  const [systolic, setSystolic] = useState('');
  const [diastolic, setDiastolic] = useState('');
  const [heartRate, setHeartRate] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!systolic || !diastolic || !heartRate) {
      return;
    }

    const systolicNum = parseInt(systolic);
    const diastolicNum = parseInt(diastolic);
    const heartRateNum = parseInt(heartRate);

    if (isNaN(systolicNum) || isNaN(diastolicNum) || isNaN(heartRateNum)) {
      return;
    }

    if (systolicNum <= 0 || diastolicNum <= 0 || heartRateNum <= 0) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit({
        systolic: systolicNum,
        diastolic: diastolicNum,
        heart_rate: heartRateNum,
      });
      setSystolic('');
      setDiastolic('');
      setHeartRate('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Activity className="text-sky-500" size={24} />
          <span>Registrar Medición</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Presión Sistólica (mmHg)"
            type="number"
            placeholder="120"
            value={systolic}
            onChange={(e) => setSystolic(e.target.value)}
            required
            min="1"
          />
          <Input
            label="Presión Diastólica (mmHg)"
            type="number"
            placeholder="80"
            value={diastolic}
            onChange={(e) => setDiastolic(e.target.value)}
            required
            min="1"
          />
          <Input
            label="Ritmo Cardíaco (bpm)"
            type="number"
            placeholder="70"
            value={heartRate}
            onChange={(e) => setHeartRate(e.target.value)}
            required
            min="1"
          />
          <Button type="submit" className="w-full" loading={loading}>
            Registrar Medición
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

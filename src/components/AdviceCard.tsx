import React from 'react';
import { Card, CardHeader, CardTitle, CardContent } from './ui/Card';
import { Lightbulb } from 'lucide-react';

interface AdviceCardProps {
  advice: string | null;
}

export function AdviceCard({ advice }: AdviceCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Lightbulb className="text-sky-500" size={24} />
          <span>Consejo de Bienestar Diario</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {advice ? (
          <p className="text-gray-700 italic leading-relaxed">
            "{advice}"
          </p>
        ) : (
          <p className="text-gray-500 text-center py-4">
            Cargando consejo...
          </p>
        )}
      </CardContent>
    </Card>
  );
}

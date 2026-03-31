export function calculateStatus(
  systolic: number,
  diastolic: number
): 'Normal' | 'Elevada' | 'Hipertensión' {
  if (systolic < 120 && diastolic < 80) {
    return 'Normal';
  } else if (systolic >= 120 && systolic <= 129 && diastolic < 80) {
    return 'Elevada';
  } else {
    return 'Hipertensión';
  }
}

export function getStatusColor(status: string): string {
  switch (status) {
    case 'Normal':
      return 'text-green-600';
    case 'Elevada':
      return 'text-yellow-600';
    case 'Hipertensión':
      return 'text-red-600';
    default:
      return 'text-gray-600';
  }
}

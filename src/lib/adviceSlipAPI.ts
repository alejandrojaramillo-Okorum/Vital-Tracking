export interface AdviceSlip {
  slip: {
    id: number;
    advice: string;
  };
}

export async function fetchAdvice(): Promise<string> {
  try {
    const response = await fetch('https://api.adviceslip.com/advice');
    if (!response.ok) {
      throw new Error('Error al obtener consejo');
    }
    const data: AdviceSlip = await response.json();
    return data.slip.advice;
  } catch (error) {
    console.error('Error fetching advice:', error);
    throw error;
  }
}

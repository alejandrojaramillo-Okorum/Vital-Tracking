import { useState, useEffect } from 'react';

export function useDarkMode() {
  const [darkMode, setDarkMode] = useState(() => {
    return localStorage.getItem('vitaltrack-darkmode') === 'true';
  });

  useEffect(() => {
    const root = document.documentElement;
    if (darkMode) {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('vitaltrack-darkmode', String(darkMode));
  }, [darkMode]);

  return { darkMode, setDarkMode };
}

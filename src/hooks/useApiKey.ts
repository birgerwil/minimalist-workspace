import { useState, useEffect } from 'react';

export function useApiKey() {
  const [hasKey, setHasKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Tjek først miljø-variabler (hardcoded / deployment)
    const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY ?? 
                   (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : null);
                   
    if (envKey) {
      setHasKey(true);
      setIsLoading(false);
      return;
    }

    // Tjek localStorage fallback (user provided)
    const localKey = localStorage.getItem('GEMINI_API_KEY');
    if (localKey) {
      setHasKey(true);
    }
    setIsLoading(false);
  }, []);

  const saveKey = (key: string) => {
    if (!key.trim()) return;
    localStorage.setItem('GEMINI_API_KEY', key.trim());
    setHasKey(true);
  };

  const removeKey = () => {
    localStorage.removeItem('GEMINI_API_KEY');
    setHasKey(false);
  };

  return { hasKey, isLoading, saveKey, removeKey };
}

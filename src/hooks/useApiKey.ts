import { useState, useEffect } from 'react';

export function useApiKey() {
  const [hasKey, setHasKey] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkKeys() {
      try {
        console.log("[useApiKey] 🔍 Fetching server config...");
        // 1. Tjek om serveren har en system-nøgle (Proxy-mode)
        const res = await fetch('/api/config');
        const config = await res.json();
        
        console.log("[useApiKey] 🛰️ Server Config:", config);

        if (config.hasSystemKey) {
          console.log("[useApiKey] ✅ Server has system key. Bypassing local prompt.");
          setHasKey(true);
          setIsLoading(false);
          return;
        }

        // 2. Tjek miljø-variabler (hardcoded / build-time)
        const envKey = (import.meta as any).env?.VITE_GEMINI_API_KEY ?? 
                       (typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : null);
                       
        if (envKey) {
          setHasKey(true);
          setIsLoading(false);
          return;
        }

        // 3. Tjek localStorage fallback (user provided / BYOK)
        const localKey = localStorage.getItem('GEMINI_API_KEY');
        if (localKey) {
          setHasKey(true);
        }
      } catch (err) {
        console.error("Failed to check server config:", err);
      } finally {
        setIsLoading(false);
      }
    }

    checkKeys();
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

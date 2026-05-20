import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SiteConfig } from '../types';
import configData from '../config.json';

const INITIAL_CONFIG = configData as SiteConfig;

interface SiteContextType {
  config: SiteConfig;
  updateConfig: (newConfig: SiteConfig) => Promise<void>;
  resetConfig: () => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(INITIAL_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // 1. Try to load from localStorage first for immediate persistence,
    // but only if the bundled config hasn't updated in a new deployment.
    const CURRENT_CACHE_KEY = 'bmg_studio_config_fallback_v4';
    const CURRENT_ORIGINAL_KEY = 'bmg_studio_config_fallback_v4_bundled_original';

    const savedConfig = localStorage.getItem(CURRENT_CACHE_KEY);
    const originalBundledStr = localStorage.getItem(CURRENT_ORIGINAL_KEY);
    const currentBundledStr = JSON.stringify(INITIAL_CONFIG);

    let useFallback = false;
    if (savedConfig && originalBundledStr === currentBundledStr) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        useFallback = true;
      } catch (err) {
        console.error('Failed to parse saved config:', err);
      }
    } else {
      // Clear all legacy and current config cache keys to ensure a completely clean slate
      const keysToClear = [
        'bmg_studio_config_fallback_v2',
        'bmg_studio_config_fallback_v3',
        'bmg_studio_config_fallback_v3_bundled_original',
        CURRENT_CACHE_KEY,
        CURRENT_ORIGINAL_KEY
      ];
      keysToClear.forEach(key => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn('Failed clearing key:', key, e);
        }
      });
      console.log('Detected fresh deployment or mismatch. Cleared configuration cache.');
    }

    if (!useFallback) {
      try {
        localStorage.setItem(CURRENT_ORIGINAL_KEY, currentBundledStr);
      } catch (e) {
        console.warn('Failed to store bundled original in localStorage:', e);
      }
    }

    // 2. Then try to fetch from API for potential server-side updates
    fetch(`/api/config?t=${Date.now()}`)
      .then(res => {
        if (!res.ok) {
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        const contentType = res.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          throw new Error('Not JSON content');
        }
        return res.json();
      })
      .then(data => {
        if (data && !data.error) {
          setConfig(data);
          localStorage.setItem('bmg_studio_config_fallback_v4', JSON.stringify(data));
          localStorage.setItem('bmg_studio_config_fallback_v4_bundled_original', JSON.stringify(INITIAL_CONFIG));
        }
      })
      .catch(err => {
        // Expected to fail on static hosts like GitHub/Netlify
        console.log('API config fetch skipped or failed (likely static deployment):', err instanceof Error ? err.message : err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const updateConfig = async (newConfig: SiteConfig) => {
    setConfig(newConfig);
    localStorage.setItem('bmg_studio_config_fallback_v4', JSON.stringify(newConfig));
    localStorage.setItem('bmg_studio_config_fallback_v4_bundled_original', JSON.stringify(INITIAL_CONFIG));
    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      if (!response.ok) throw new Error('Failed to save to server');
    } catch (err) {
      console.error('Failed to save config to server:', err);
      // We still updated local state and localStorage, so it's "saved" for the user session
    }
  };

  const resetConfig = () => {
    updateConfig(INITIAL_CONFIG);
  };

  if (isLoading) {
    return <div className="h-screen w-full flex items-center justify-center bg-[#FFEEDF]">Loading...</div>;
  }

  return (
    <SiteContext.Provider value={{ config, updateConfig, resetConfig }}>
      {children}
    </SiteContext.Provider>
  );
}

export function useSite() {
  const context = useContext(SiteContext);
  if (!context) {
    throw new Error('useSite must be used within a SiteProvider');
  }
  return context;
}

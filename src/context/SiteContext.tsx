import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { SiteConfig } from '../types';
import { DEFAULT_SITE_CONFIG } from '../constants';

interface SiteContextType {
  config: SiteConfig;
  updateConfig: (newConfig: SiteConfig) => void;
  resetConfig: () => void;
}

const SiteContext = createContext<SiteContextType | undefined>(undefined);

export function SiteProvider({ children }: { children: ReactNode }) {
  const [config, setConfig] = useState<SiteConfig>(DEFAULT_SITE_CONFIG);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Try to load from API first
    fetch(`/api/config?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setConfig(data);
          localStorage.setItem('bmg_studio_config_fallback', JSON.stringify(data));
        } else {
          // If API fails, try local storage fallback
          const local = localStorage.getItem('bmg_studio_config_fallback');
          if (local) setConfig(JSON.parse(local));
        }
      })
      .catch(err => {
        console.error('Failed to fetch config:', err);
        const local = localStorage.getItem('bmg_studio_config_fallback');
        if (local) setConfig(JSON.parse(local));
      })
      .finally(() => setIsLoading(false));
  }, []);

  const updateConfig = async (newConfig: SiteConfig) => {
    setConfig(newConfig);
    localStorage.setItem('bmg_studio_config_fallback', JSON.stringify(newConfig));
    try {
      await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
    } catch (err) {
      console.error('Failed to save config:', err);
    }
  };

  const resetConfig = () => {
    updateConfig(DEFAULT_SITE_CONFIG);
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

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
    // Try to load from API first to get real-time updates in dev
    fetch(`/api/config?t=${Date.now()}`)
      .then(res => res.json())
      .then(data => {
        if (data && !data.error) {
          setConfig(data);
          localStorage.setItem('bmg_studio_config_fallback_v2', JSON.stringify(data));
        }
      })
      .catch(err => {
        console.error('Failed to fetch config:', err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const updateConfig = async (newConfig: SiteConfig) => {
    setConfig(newConfig);
    localStorage.setItem('bmg_studio_config_fallback_v2', JSON.stringify(newConfig));
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

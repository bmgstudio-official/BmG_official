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
  const [config, setConfig] = useState<SiteConfig>(() => {
    const saved = localStorage.getItem('bmg_studio_config');
    return saved ? JSON.parse(saved) : DEFAULT_SITE_CONFIG;
  });

  const updateConfig = (newConfig: SiteConfig) => {
    setConfig(newConfig);
    localStorage.setItem('bmg_studio_config', JSON.stringify(newConfig));
  };

  const resetConfig = () => {
    setConfig(DEFAULT_SITE_CONFIG);
    localStorage.removeItem('bmg_studio_config');
  };

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

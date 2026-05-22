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
    const PERSISTENT_KEY = 'bmg_studio_persistent_user_config';
    
    // 1. Load from localStorage if available (fast initial render)
    const savedConfig = localStorage.getItem(PERSISTENT_KEY);
    if (savedConfig) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
      } catch (err) {
        console.error('Failed to parse saved persistent config:', err);
      }
    }

    // Clean up all legacy / temporary / versioned cache keys to keep local storage clean
    const legacyKeys = [
      'bmg_studio_config_fallback_v2',
      'bmg_studio_config_fallback_v3',
      'bmg_studio_config_fallback_v3_bundled_original',
      'bmg_studio_config_fallback_v4',
      'bmg_studio_config_fallback_v4_bundled_original',
      'bmg_studio_config_fallback_v5',
      'bmg_studio_config_fallback_v5_bundled_original',
      'bmg_studio_config_fallback_v6',
      'bmg_studio_config_fallback_v6_bundled_original',
      'bmg_studio_config_fallback_v7',
      'bmg_studio_config_fallback_v7_bundled_original',
      'bmg_studio_admin_active_v7',
      'bmg_studio_config_fallback_v15',
      'bmg_studio_config_fallback_v15_bundled_original',
      'bmg_studio_admin_active_v15'
    ];
    legacyKeys.forEach(key => {
      try {
        localStorage.removeItem(key);
      } catch (e) {
        // Safe to ignore
      }
    });

    // 2. Fetch from Express API (if active) to get the true, saved config.json from disk
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
          localStorage.setItem(PERSISTENT_KEY, JSON.stringify(data));
        }
      })
      .catch(err => {
        // Expected to fail on static environments like Netlify (graceful fallback to current build config)
        console.log('Using compiled configuration or local cache:', err instanceof Error ? err.message : err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const updateConfig = async (newConfig: SiteConfig) => {
    setConfig(newConfig);
    const PERSISTENT_KEY = 'bmg_studio_persistent_user_config';

    try {
      localStorage.setItem(PERSISTENT_KEY, JSON.stringify(newConfig));
    } catch (e) {
      console.warn('Failed writing to localStorage:', e);
    }

    try {
      const response = await fetch('/api/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newConfig),
      });
      if (!response.ok) throw new Error('Failed to save to server');
    } catch (err) {
      console.error('Failed to save config to server:', err);
    }
  };

  const resetConfig = () => {
    const PERSISTENT_KEY = 'bmg_studio_persistent_user_config';
    try {
      localStorage.removeItem(PERSISTENT_KEY);
    } catch (e) {
      console.warn('Failed clearing user config key:', e);
    }
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

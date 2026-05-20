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
    // We use version-controlled keys to separate caches and cleanly reset on new deployments
    const CURRENT_CACHE_KEY = 'bmg_studio_config_fallback_v6';
    const CURRENT_ORIGINAL_KEY = 'bmg_studio_config_fallback_v6_bundled_original';
    const ADMIN_ACTIVE_KEY = 'bmg_studio_admin_active_v6';

    const savedConfig = localStorage.getItem(CURRENT_CACHE_KEY);
    const originalBundledStr = localStorage.getItem(CURRENT_ORIGINAL_KEY);
    const currentBundledStr = JSON.stringify(INITIAL_CONFIG);
    const isAdminActive = localStorage.getItem(ADMIN_ACTIVE_KEY) === 'true';

    let useFallback = false;
    
    // Only load from localStorage if the user has active admin privileges (e.g. they are testing)
    // AND the static bundle hasn't been updated since the last build.
    if (isAdminActive && savedConfig && originalBundledStr === currentBundledStr) {
      try {
        const parsed = JSON.parse(savedConfig);
        setConfig(parsed);
        useFallback = true;
      } catch (err) {
        console.error('Failed to parse saved config:', err);
      }
    } else {
      // Clear legacy and current cache keys to preserve clean environment state
      const keysToClear = [
        'bmg_studio_config_fallback_v2',
        'bmg_studio_config_fallback_v3',
        'bmg_studio_config_fallback_v3_bundled_original',
        'bmg_studio_config_fallback_v4',
        'bmg_studio_config_fallback_v4_bundled_original',
        'bmg_studio_config_fallback_v5',
        'bmg_studio_config_fallback_v5_bundled_original',
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
      
      // Reset admin active flag if bundle has been updated or if this was a plain visitor
      if (!isAdminActive || originalBundledStr !== currentBundledStr) {
        try {
          localStorage.removeItem(ADMIN_ACTIVE_KEY);
        } catch (e) {
          console.warn('Failed clearing admin active key:', e);
        }
      }
      console.log('Clean slate loaded: using freshly compiled production configurations.');
    }

    if (!useFallback) {
      try {
        localStorage.setItem(CURRENT_ORIGINAL_KEY, currentBundledStr);
      } catch (e) {
        console.warn('Failed to store bundled original in localStorage:', e);
      }
    }

    // 2. Then try to fetch from API for potential server-side updates (works on active containers)
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
          localStorage.setItem('bmg_studio_config_fallback_v6', JSON.stringify(data));
          localStorage.setItem('bmg_studio_config_fallback_v6_bundled_original', JSON.stringify(INITIAL_CONFIG));
        }
      })
      .catch(err => {
        // Expected to fail on static hosts like GitHub/Netlify, graceful fallback is already current state
        console.log('API config fetch skipped or failed (likely static deployment):', err instanceof Error ? err.message : err);
      })
      .finally(() => setIsLoading(false));
  }, []);

  const updateConfig = async (newConfig: SiteConfig) => {
    setConfig(newConfig);
    const CURRENT_CACHE_KEY = 'bmg_studio_config_fallback_v6';
    const CURRENT_ORIGINAL_KEY = 'bmg_studio_config_fallback_v6_bundled_original';
    const ADMIN_ACTIVE_KEY = 'bmg_studio_admin_active_v6';

    try {
      localStorage.setItem(CURRENT_CACHE_KEY, JSON.stringify(newConfig));
      localStorage.setItem(CURRENT_ORIGINAL_KEY, JSON.stringify(INITIAL_CONFIG));
      localStorage.setItem(ADMIN_ACTIVE_KEY, 'true');
    } catch (e) {
      console.warn('Failed writing keys to localStorage:', e);
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
    try {
      localStorage.removeItem('bmg_studio_admin_active_v6');
    } catch (e) {
      console.warn('Failed clearing admin active key:', e);
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

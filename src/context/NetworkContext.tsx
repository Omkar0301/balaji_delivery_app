import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { OfflineBanner } from '../components/feedback/OfflineBanner';

interface NetworkContextValue {
  isOffline: boolean;
  isRestored: boolean;
  checkConnection: () => Promise<boolean>;
}

const NetworkContext = createContext<NetworkContextValue | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOffline, setIsOffline] = useState(false);
  const [isRestored, setIsRestored] = useState(false);
  const restoreTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const checkConnection = useCallback(async (): Promise<boolean> => {
    try {
      // Lightweight connectivity probe
      const res = await fetch('https://clients3.google.com/generate_204', {
        method: 'HEAD',
        cache: 'no-store',
      });
      const online = res.status === 204 || res.ok;
      if (isOffline && online) {
        setIsRestored(true);
        if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
        restoreTimerRef.current = setTimeout(() => setIsRestored(false), 3000);
      }
      setIsOffline(!online);
      return online;
    } catch {
      setIsOffline(true);
      return false;
    }
  }, [isOffline]);

  useEffect(() => {
    let active = true;
    const probe = async () => {
      try {
        const res = await fetch('https://clients3.google.com/generate_204', {
          method: 'HEAD',
          cache: 'no-store',
        });
        if (active) {
          setIsOffline(!(res.status === 204 || res.ok));
        }
      } catch {
        if (active) {
          setIsOffline(true);
        }
      }
    };
    const timer = setTimeout(() => {
      probe().catch(() => {});
    }, 100);
    return () => {
      active = false;
      clearTimeout(timer);
      if (restoreTimerRef.current) clearTimeout(restoreTimerRef.current);
    };
  }, []);

  return (
    <NetworkContext.Provider value={{ isOffline, isRestored, checkConnection }}>
      <OfflineBanner isOffline={isOffline} isRestored={isRestored} />
      {children}
    </NetworkContext.Provider>
  );
};

export function useNetworkStatus() {
  const context = useContext(NetworkContext);
  if (!context) {
    throw new Error('useNetworkStatus must be used within a NetworkProvider');
  }
  return context;
}

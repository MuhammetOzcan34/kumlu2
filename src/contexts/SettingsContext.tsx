import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SettingsContextType {
  settings: Record<string, string> | undefined;
  isLoading: boolean;
  error: Error | null;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { data: settings, isLoading, error } = useQuery<Record<string, string>>({
    queryKey: ['settings'],
    queryFn: async () => {
      console.log('🔍 Fetching settings from database...');
      const { data, error } = await supabase
        .from('ayarlar')
        .select('anahtar, deger');

      if (error) {
        console.error('❌ Settings fetch error:', error);
        throw error;
      }

      const settingsObj: Record<string, string> = {};
      data?.forEach((setting) => {
        settingsObj[setting.anahtar] = setting.deger;
      });

      console.log('✅ Settings loaded:', settingsObj);
      return settingsObj;
    },
    staleTime: 1000 * 60 * 10, // 10 dakika
    gcTime: 1000 * 60 * 30,    // 30 dakika
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });

  return (
    <SettingsContext.Provider value={{ settings, isLoading, error }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettingsContext = () => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettingsContext must be used within a SettingsProvider');
  }
  return context;
};

// Tek bir ayar değerini almak için yardımcı hook
export const useSetting = (key: string): string | undefined => {
  const { settings } = useSettingsContext();
  return settings?.[key];
};

// Tüm ayarları almak için hook
export const useSettings = () => {
  const { settings, isLoading, error } = useSettingsContext();
  return { data: settings, isLoading, error };
};
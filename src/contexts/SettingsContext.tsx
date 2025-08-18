import React, { createContext, useContext, ReactNode } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

interface SettingsContextType {
  settings: Record<string, string> | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
  updateSetting: (key: string, value: string) => Promise<void>;
  updateMultipleSettings: (settings: Record<string, string>) => Promise<void>;
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined);

export const SettingsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = useQueryClient();
  
  const { data: settings, isLoading, error, refetch } = useQuery<Record<string, string>>({
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

  // Tek ayar güncelleme mutation'ı
  const updateSettingMutation = useMutation({
    mutationFn: async ({ key, value }: { key: string; value: string }) => {
      console.log('🔄 Updating setting:', key, '=', value);
      const { data, error } = await supabase
        .from('ayarlar')
        .upsert(
          { anahtar: key, deger: value },
          { 
            onConflict: 'anahtar',
            ignoreDuplicates: false 
          }
        )
        .select()
        .single();

      if (error) {
        console.error('❌ Setting update error:', error);
        throw error;
      }
      
      console.log('✅ Setting updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  // Çoklu ayar güncelleme mutation'ı
  const updateMultipleSettingsMutation = useMutation({
    mutationFn: async (settingsToUpdate: Record<string, string>) => {
      console.log('🔄 Updating multiple settings:', settingsToUpdate);
      const upsertData = Object.entries(settingsToUpdate).map(([key, value]) => ({
        anahtar: key,
        deger: value,
      }));

      const { data, error } = await supabase
        .from('ayarlar')
        .upsert(
          upsertData,
          { 
            onConflict: 'anahtar',
            ignoreDuplicates: false 
          }
        )
        .select();

      if (error) {
        console.error('❌ Multiple settings update error:', error);
        throw error;
      }
      
      console.log('✅ Multiple settings updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['settings'] });
    },
  });

  const updateSetting = async (key: string, value: string) => {
    await updateSettingMutation.mutateAsync({ key, value });
  };

  const updateMultipleSettings = async (settingsToUpdate: Record<string, string>) => {
    await updateMultipleSettingsMutation.mutateAsync(settingsToUpdate);
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      isLoading, 
      error, 
      refetch, 
      updateSetting, 
      updateMultipleSettings 
    }}>
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
  const { settings, isLoading, error, refetch } = useSettingsContext();
  return { data: settings, isLoading, error, refetch };
};
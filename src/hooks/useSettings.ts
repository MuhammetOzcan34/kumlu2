// hooks/useSettings.ts
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';

export const useSettings = () => {
  return useQuery<Record<string, string>>({
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

      const settings: Record<string, string> = {};
      data?.forEach((setting) => {
        settings[setting.anahtar] = setting.deger;
      });

      console.log('✅ Settings loaded:', settings);
      return settings;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30,    // 30 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });
};

// Tek bir ayar değerini almak için yardımcı hook
export const useSetting = (key: string): string | undefined => {
  const { data: settings } = useSettings();
  return settings?.[key];
};
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      console.log('🔍 Fetching settings from database...');
      const { data, error } = await supabase
        .from("ayarlar")
        .select("*");
      
      if (error) {
        console.error('❌ Settings fetch error:', error);
        throw error;
      }
      
      // Convert array to object for easier access
      const settings: Record<string, string> = {};
      data?.forEach((setting) => {
        settings[setting.anahtar] = setting.deger;
      });
      
      console.log('✅ Settings loaded:', settings);
      return settings;
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 2,
    retryDelay: 1000,
  });
};

export const useSetting = (key: string) => {
  const { data: settings } = useSettings();
  return settings?.[key] || "";
};
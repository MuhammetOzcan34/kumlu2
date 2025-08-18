import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export const useSettings = () => {
  return useQuery({
    queryKey: ["settings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("ayarlar")
        .select("*");
      
      if (error) throw error;
      
      // Convert array to object for easier access
      const settings: Record<string, string> = {};
      data?.forEach((setting) => {
        settings[setting.anahtar] = setting.deger;
      });
      
      return settings;
    },
  });
};

export const useSetting = (key: string) => {
  const { data: settings } = useSettings();
  return settings?.[key] || "";
};
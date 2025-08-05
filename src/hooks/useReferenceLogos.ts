import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ReferenceLogo {
  id: string;
  baslik: string | null;
  aciklama: string | null;
  dosya_yolu: string;
  kategori_adi: string | null;
  aktif: boolean;
  created_at: string;
  updated_at: string;
}

export const useReferenceLogos = () => {
  return useQuery({
    queryKey: ["reference-logos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fotograflar")
        .select("*")
        .eq("aktif", true)
        .or("gorsel_tipi.eq.referans_logo,kullanim_alani.cs.{referanslar}")
        .order("sira_no", { ascending: true });
      
      if (error) throw error;
      return data as ReferenceLogo[];
    },
  });
};

export const getReferenceLogoUrl = (filePath: string) => {
  return supabase.storage.from("fotograflar").getPublicUrl(filePath).data.publicUrl;
};
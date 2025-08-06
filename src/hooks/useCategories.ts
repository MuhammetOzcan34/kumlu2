import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CategoryType = "kumlama" | "tabela" | "arac-giydirme";

export interface Category {
  id: string;
  ad: string;
  slug: string;
  aciklama: string | null;
  tip: CategoryType;
  sira_no: number;
  aktif: boolean;
  created_at: string;
  updated_at: string;
}

export const useCategories = (type?: CategoryType) => {
  return useQuery({
    queryKey: ["categories", type],
    queryFn: async () => {
      try {
        console.log('🔍 Kategoriler çekiliyor...', type ? `Tip: ${type}` : 'Tüm kategoriler');
        
        let query = supabase
          .from("kategoriler")
          .select("*")
          .eq("aktif", true)
          .order("sira_no", { ascending: true });
        
        if (type) {
          query = query.eq("tip", type as any); // Temporary fix for enum type mismatch
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('❌ Categories fetch error:', error);
          return []; // Return empty array instead of throwing
        }
        
        const categories = data as Category[] || [];
        console.log(`✅ ${categories.length} kategori yüklendi`, type ? `(${type} tipi)` : '');
        return categories;
      } catch (error) {
        console.error('❌ useCategories hook error:', error);
        return []; // Hata durumunda boş dizi döndür
      }
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: true, // Sayfa odaklandığında yeniden yükle
    retry: 2,
    retryDelay: 1000,
  });
};
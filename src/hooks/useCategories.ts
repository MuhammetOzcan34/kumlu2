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
        console.log('🔍 useCategories - Kategoriler çekiliyor...', type ? `Tip: ${type}` : 'Tüm kategoriler');
        
        let query = supabase
          .from("kategoriler")
          .select("*")
          .eq("aktif", true)
          .order("sira_no", { ascending: true });
        
        if (type) {
          query = query.eq("tip", type as any); // Temporary fix for enum type mismatch
          console.log(`🔍 useCategories - ${type} tipindeki kategoriler filtreleniyor`);
        }
        
        const { data, error } = await query;
        
        if (error) {
          console.error('❌ useCategories - Kategori çekme hatası:', error);
          return []; // Return empty array instead of throwing
        }
        
        const categories = data as Category[] || [];
        console.log(`✅ useCategories - ${categories.length} kategori yüklendi`, type ? `(${type} tipi)` : '');
        
        if (categories.length === 0) {
          console.warn(`⚠️ useCategories - ${type ? type + ' tipinde ' : ''}Hiç kategori bulunamadı!`);
        } else {
          console.log(`📊 useCategories - İlk kategori örneği:`, categories[0]);
        }
        
        return categories;
      } catch (error) {
        console.error('❌ useCategories hook error:', error);
        return []; // Hata durumunda boş dizi döndür
      }
    },
    staleTime: 1000 * 60 * 3, // 3 dakika (5 dakikadan düşürüldü)
    gcTime: 1000 * 60 * 10, // 10 dakika (15 dakikadan düşürüldü)
    refetchOnWindowFocus: true, // Sayfa odaklandığında yeniden yükle
    refetchOnMount: true, // Bileşen mount olduğunda yeniden yükle
    retry: 3, // Hata durumunda 3 kez dene (2'den artırıldı)
    retryDelay: 1000,
  });
};
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface Photo {
  id: string;
  baslik: string | null;
  aciklama: string | null;
  dosya_yolu: string;
  kategori_id: string | null;
  aktif: boolean;
  created_at: string;
  updated_at: string;
  kullanim_alani?: string[];
}

export const usePhotos = (categoryId?: string, usageArea?: string) => {
  return useQuery({
    queryKey: ["photos", categoryId, usageArea],
    queryFn: async () => {
      let query = supabase
        .from("fotograflar")
        .select("*")
        .eq("aktif", true)
        .order("created_at", { ascending: false });
      
      // Kategori ID'sinin geçerli olup olmadığını kontrol et
      if (categoryId && typeof categoryId === 'string') {
        try {
          // Null, undefined veya boş string kontrolü
          const trimmedCategoryId = categoryId.trim();
          if (trimmedCategoryId !== '') {
            query = query.eq("kategori_id", trimmedCategoryId);
          }
        } catch (error) {
          console.warn('⚠️ Geçersiz kategori ID:', categoryId);
          // Hata durumunda sorguyu devam ettir, filtreleme yapma
        }
      }
      
      if (usageArea) {
        query = query.contains("kullanim_alani", [usageArea]);
      }
      
      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Photos fetch error:', error);
        console.error('🔍 Query details:', { categoryId, usageArea });
        return []; // Return empty array instead of throwing
      }
      
      console.log('📸 Fotoğraflar yüklendi:', data?.length || 0, 'adet');
      return data as Photo[] || [];
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    gcTime: 1000 * 60 * 15, // 15 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 2000,
    enabled: true, // Her zaman etkinleştir, içeride kontrol yapılıyor
  });
};

export const getImageUrl = (filePath: string) => {
  return supabase.storage.from("fotograflar").getPublicUrl(filePath).data.publicUrl;
};
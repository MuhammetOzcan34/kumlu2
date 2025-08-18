import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { requestLimiter } from "@/utils/debounce";

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
      const requestKey = `photos-${categoryId || 'all'}-${usageArea || 'all'}`;
      
      // Request limiting kontrolü
      if (!requestLimiter.canMakeRequest(requestKey)) {
        console.log('🚫 Request throttled:', requestKey);
        // Önceki veriyi döndür veya boş array
        return [];
      }
      let query = supabase
        .from("fotograflar")
        .select("*")
        .eq("aktif", true)
        .order("created_at", { ascending: false });
      
      // Kategori ID'sinin geçerli olup olmadığını kontrol et
      if (categoryId) {
        try {
          // Önce categoryId'nin string olduğundan emin ol
          if (typeof categoryId === 'string') {
            // Null, undefined veya boş string kontrolü
            // Trim işleminden önce categoryId'nin string olduğundan emin olalım
            const trimmedCategoryId = categoryId.trim();
            console.log('🔍 Kategori ID kontrolü:', { categoryId, trimmedCategoryId, type: typeof categoryId });
            
            if (trimmedCategoryId !== '' && trimmedCategoryId !== 'undefined') {
              query = query.eq("kategori_id", trimmedCategoryId);
              console.log('✅ Kategori ID ile filtreleniyor:', trimmedCategoryId);
            } else {
              console.log('⚠️ Boş veya geçersiz kategori ID, filtreleme yapılmıyor');
            }
          } else {
            console.warn('⚠️ Kategori ID string değil:', typeof categoryId, categoryId);
          }
        } catch (error) {
          console.warn('⚠️ Kategori ID işlenirken hata:', error, 'ID:', categoryId, 'Tip:', typeof categoryId);
          // Hata durumunda sorguyu devam ettir, filtreleme yapma
        }
      } else {
        console.log('ℹ️ Kategori ID belirtilmemiş, tüm fotoğraflar getiriliyor');
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
      
      console.log('📸 Fotoğraflar yüklendi:', data?.length || 0, 'adet', 'Key:', requestKey);
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

// Fotoğraf CRUD işlemleri için mutation hook'ları
export const useCreatePhoto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (photo: Omit<Photo, "id" | "created_at" | "updated_at">) => {
      console.log('📸 Creating new photo:', photo);
      const { data, error } = await supabase
        .from("fotograflar")
        .insert([photo])
        .select()
        .single();

      if (error) {
        console.error('❌ Photo creation error:', error);
        throw error;
      }
      
      console.log('✅ Photo created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
};

export const useUpdatePhoto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Photo> & { id: string }) => {
      console.log('📸 Updating photo:', id, updates);
      const { data, error } = await supabase
        .from("fotograflar")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error('❌ Photo update error:', error);
        throw error;
      }
      
      console.log('✅ Photo updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
};

export const useDeletePhoto = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log('📸 Deleting photo:', id);
      
      // Önce fotoğraf bilgilerini al (dosya yolunu almak için)
      const { data: photo, error: fetchError } = await supabase
        .from("fotograflar")
        .select("dosya_yolu")
        .eq("id", id)
        .single();

      if (fetchError) {
        console.error('❌ Photo fetch error for deletion:', fetchError);
        throw fetchError;
      }

      // Veritabanından sil
      const { error: deleteError } = await supabase
        .from("fotograflar")
        .delete()
        .eq("id", id);

      if (deleteError) {
        console.error('❌ Photo deletion error:', deleteError);
        throw deleteError;
      }

      // Storage'dan da sil
      if (photo?.dosya_yolu) {
        const { error: storageError } = await supabase.storage
          .from("fotograflar")
          .remove([photo.dosya_yolu]);

        if (storageError) {
          console.warn('⚠️ Storage deletion warning:', storageError);
          // Storage hatası kritik değil, devam et
        }
      }
      
      console.log('✅ Photo deleted:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["photos"] });
    },
  });
};

// Slider fotoğrafları için optimize edilmiş query
export const useSliderPhotos = () => {
  return useQuery({
    queryKey: ["photos", "slider"],
    queryFn: async () => {
      console.log('🎠 Fetching slider photos...');
      const { data, error } = await supabase
        .from("fotograflar")
        .select("id, dosya_yolu, baslik, aciklama, sira_no")
        .eq("aktif", true)
        .or("gorsel_tipi.eq.slider,kullanim_alani.cs.{ana-sayfa-slider}")
        .order("sira_no", { ascending: true })
        .limit(10);

      if (error) {
        console.error('❌ Slider photos fetch error:', error);
        throw error;
      }
      
      console.log('✅ Slider photos loaded:', data?.length || 0);
      return data as Photo[];
    },
    staleTime: 1000 * 60 * 5, // 5 dakika
    gcTime: 1000 * 60 * 15, // 15 dakika
    refetchOnWindowFocus: false,
    retry: 2,
  });
};
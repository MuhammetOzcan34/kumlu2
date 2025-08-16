import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { requestLimiter } from "@/utils/debounce";

export interface Video {
  id: string;
  baslik: string;
  aciklama: string | null;
  youtube_url: string;
  youtube_id: string | null;
  thumbnail_url: string | null;
  kategori: string | null;
  aktif: boolean;
  sira_no: number;
  created_at: string;
  updated_at: string;
}

export const useVideos = () => {
  const { data: videos = [], isLoading: loading, error, refetch } = useQuery({
    queryKey: ["videos"],
    queryFn: async () => {
      const requestKey = 'videos-all';
      
      // Request limiting kontrolü
      if (!requestLimiter.canMakeRequest(requestKey)) {
        console.log('🚫 Request throttled:', requestKey);
        return [];
      }
      const { data, error } = await supabase
        .from("video_galeri")
        .select("*")
        .eq("aktif", true)
        .order("sira_no", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) {
        console.error('❌ Videos fetch error:', error);
        throw error;
      }

      console.log('🎥 Videolar yüklendi:', data?.length || 0, 'adet', 'Key:', requestKey);
      return data as Video[] || [];
    },
    staleTime: 1000 * 60 * 5, // 5 dakika
    gcTime: 1000 * 60 * 15, // 15 dakika
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 2000,
  });

  return { videos, loading, error: error?.message || null, refetch };
};
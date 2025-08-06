import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

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
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("video_galeri")
        .select("*")
        .eq("aktif", true)
        .order("sira_no", { ascending: true })
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Videolar yüklenirken hata oluştu");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  return { videos, loading, error, refetch: fetchVideos };
};
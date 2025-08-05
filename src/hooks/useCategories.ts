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
      return data as Category[] || [];
    },
    staleTime: 1000 * 60 * 10, // 10 minutes
    gcTime: 1000 * 60 * 30, // 30 minutes
    refetchOnWindowFocus: false,
    retry: 1,
    retryDelay: 2000,
  });
};
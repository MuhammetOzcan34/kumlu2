import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type CategoryType = "kumlama" | "tabela";

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
        query = query.eq("tip", type);
      }
      
      const { data, error } = await query;
      
      if (error) throw error;
      return data as Category[];
    },
  });
};
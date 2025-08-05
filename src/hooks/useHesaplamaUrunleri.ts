import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface HesaplamaUrunu {
  id: string;
  ad: string;
  aciklama?: string;
  kategori: string;
  aktif: boolean;
  sira_no: number;
  created_at: string;
  updated_at: string;
}

export interface HesaplamaFiyat {
  id: string;
  urun_id: string;
  metrekare_min: number;
  metrekare_max: number;
  malzeme_fiyat: number;
  montaj_fiyat: number;
  created_at: string;
  updated_at: string;
}

export interface HesaplamaUrunuDetay extends HesaplamaUrunu {
  fiyatlar: HesaplamaFiyat[];
}

export const useHesaplamaUrunleri = () => {
  return useQuery({
    queryKey: ["hesaplama-urunleri"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("hesaplama_urunleri")
        .select(`
          *,
          fiyatlar:hesaplama_fiyatlar(*)
        `)
        .eq("aktif", true)
        .order("sira_no", { ascending: true });

      if (error) throw error;
      return data as HesaplamaUrunuDetay[];
    },
  });
};

export const useCreateHesaplamaUrunu = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (urun: Omit<HesaplamaUrunu, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("hesaplama_urunleri")
        .insert([urun])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hesaplama-urunleri"] });
    },
  });
};

export const useUpdateHesaplamaUrunu = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HesaplamaUrunu> & { id: string }) => {
      const { data, error } = await supabase
        .from("hesaplama_urunleri")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hesaplama-urunleri"] });
    },
  });
};

export const useDeleteHesaplamaUrunu = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("hesaplama_urunleri")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hesaplama-urunleri"] });
    },
  });
};

// Fiyat yönetimi için yeni hook'lar
export const useCreateHesaplamaFiyat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (fiyat: Omit<HesaplamaFiyat, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("hesaplama_fiyatlar")
        .insert([fiyat])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hesaplama-urunleri"] });
    },
  });
};

export const useUpdateHesaplamaFiyat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<HesaplamaFiyat> & { id: string }) => {
      const { data, error } = await supabase
        .from("hesaplama_fiyatlar")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hesaplama-urunleri"] });
    },
  });
};

export const useDeleteHesaplamaFiyat = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("hesaplama_fiyatlar")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["hesaplama-urunleri"] });
    },
  });
};
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export interface ServisBedeli {
  id: string;
  kategori: string; // Veritabanında string olarak saklanıyor
  hizmet_adi: string;
  birim: string;
  birim_fiyat: number;
  aciklama?: string;
  sira_no: number;
  aktif: boolean;
  created_at: string;
  updated_at: string;
}

export const useServisBedelleri = () => {
  return useQuery({
    queryKey: ["servis-bedelleri"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("servis_bedelleri")
        .select("*")
        .eq("aktif", true)
        .order("sira_no", { ascending: true });

      if (error) throw error;
      return data as ServisBedeli[];
    },
  });
};

export const useCreateServisBedeli = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (servisBedeli: Omit<ServisBedeli, "id" | "created_at" | "updated_at">) => {
      const { data, error } = await supabase
        .from("servis_bedelleri")
        .insert([servisBedeli])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servis-bedelleri"] });
    },
  });
};

export const useUpdateServisBedeli = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ServisBedeli> & { id: string }) => {
      const { data, error } = await supabase
        .from("servis_bedelleri")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servis-bedelleri"] });
    },
  });
};

export const useDeleteServisBedeli = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("servis_bedelleri")
        .delete()
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["servis-bedelleri"] });
    },
  });
}; 
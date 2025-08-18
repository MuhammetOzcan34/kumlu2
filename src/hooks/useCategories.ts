import { useQuery, useQueryClient, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { withRetry, isResourceError, getErrorMessage, requestQueue, withFallback, getFallbackData, getCachedData, setCachedData, memoryManager, connectionManager } from "@/integrations/supabase/utils";
import { useMemo, useCallback, useRef, useEffect } from "react";

// Debounce utility
const useDebounce = <T extends unknown[]>(callback: (...args: T) => void, delay: number) => {
  const timeoutRef = useRef<NodeJS.Timeout>();
  
  return useCallback((...args: T) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    timeoutRef.current = setTimeout(() => callback(...args), delay);
  }, [callback, delay]);
};

// Cache keys
const CACHE_KEYS = {
  CATEGORIES: 'categories',
  CATEGORY_PREFETCH: 'category-prefetch',
  categories: (tip?: string) => ['categories', tip].filter(Boolean),
  categoryPrefetch: (tip?: string) => ['category-prefetch', tip].filter(Boolean),
} as const;

// Cache süresi sabitleri
const CACHE_CONFIG = {
  staleTime: 1000 * 60 * 10, // 10 dakika
  gcTime: 1000 * 60 * 30, // 30 dakika
  refetchInterval: 1000 * 60 * 15, // 15 dakikada bir otomatik yenile
} as const;

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

// Ana kategoriler fetch fonksiyonu - invalidateCache'den önce tanımlanmalı
const fetchCategories = async (tip?: string) => {
  console.log('🔄 Kategoriler yükleniyor...', { tip });
  
  const cacheKey = `categories_${tip || 'all'}`;
  
  return await withFallback(
    // Primary function
    async () => {
      return await requestQueue.add(async () => {
        return await withRetry(async () => {
          let query = supabase
            .from("kategoriler")
            .select("*")
            .eq("aktif", true)
            .order("sira_no", { ascending: true });

          if (tip) {
            query = query.eq("tip", tip);
          }

          const { data, error } = await query;

          if (error) {
            console.error('❌ Kategoriler yüklenirken hata:', error);
            
            if (isResourceError(error)) {
              throw new Error('ERR_INSUFFICIENT_RESOURCES');
            }
            
            throw error;
          }

          console.log('✅ Kategoriler başarıyla yüklendi:', data?.length || 0);
          return data || [];
        }, {
          maxAttempts: 5,
          baseDelay: 2000,
          maxDelay: 30000,
          shouldRetry: (error) => {
            return isResourceError(error) || error.message?.includes('network');
          }
        });
      }, {
        id: `categories_${tip || 'all'}`,
        priority: 'high',
        cacheTTL: 10 * 60 * 1000, // 10 dakika
        deduplicate: true
      });
    },
    // Fallback function
    () => {
      console.log('🔄 Fallback: Boş kategori listesi döndürülüyor');
      return getFallbackData<Category[]>('categories', []);
    },
    // Cache key
    cacheKey
  );
};

export const useCategories = (tip?: CategoryType) => {
  const queryClient = useQueryClient();
  const lastFetchTime = useRef<number>(0);
  const debouncedInvalidateRef = useRef<NodeJS.Timeout>();
  const hookId = useRef<string>(`useCategories-${Date.now()}-${Math.random()}`);

  // Hook cleanup - component unmount'da çalışır
  useEffect(() => {
    const currentHookId = hookId.current;
    console.log('🎣 useCategories hook mounted:', currentHookId);
    
    // Cleanup task ekle
    const cleanupTask = () => {
      console.log('🧹 useCategories cleanup:', currentHookId);
      
      // Debounced timeout'ları temizle
      if (debouncedInvalidateRef.current) {
        clearTimeout(debouncedInvalidateRef.current);
      }
      
      // Query'leri iptal et
      queryClient.cancelQueries({ queryKey: CACHE_KEYS.allCategories });
      if (tip) {
        queryClient.cancelQueries({ queryKey: CACHE_KEYS.categories(tip) });
      }
    };
    
    memoryManager.addCleanupTask(cleanupTask);
    
    return () => {
      cleanupTask();
      console.log('🎣 useCategories hook unmounted:', currentHookId);
    };
  }, [queryClient, tip]);
  
  // Cache invalidation fonksiyonu - artık fetchCategories dependency'si kaldırıldı
  const invalidateCache = useCallback(() => {
    console.log('🗑️ Kategori cache temizleniyor');
    queryClient.invalidateQueries({ queryKey: ['categories'] });
    queryClient.removeQueries({ queryKey: ['categories'] });
  }, [queryClient]);
  
  // Debounced cache invalidation
  const debouncedInvalidate = useDebounce(invalidateCache, 1000);
  
  // Prefetch diğer kategoriler
  const prefetchOtherCategories = useCallback(() => {
    const otherTypes: CategoryType[] = ['kumlama', 'tabela', 'arac-giydirme'];
    otherTypes.forEach(type => {
      if (type !== tip) {
        queryClient.prefetchQuery({
          queryKey: CACHE_KEYS.categories(type),
          queryFn: () => fetchCategories(type),
          staleTime: CACHE_CONFIG.staleTime
        });
      }
    });
  }, [queryClient, tip]);
  

  
  // Memoized query key
  const queryKey = useMemo(() => CACHE_KEYS.categories(tip), [tip]);
  
  // Ana useQuery hook'u
  const {
    data: categories = [],
    isLoading,
    error,
    refetch,
    isFetching,
    isError
  } = useQuery({
    queryKey: queryKey,
    queryFn: () => fetchCategories(tip),
    ...CACHE_CONFIG,
    refetchOnReconnect: true,
    placeholderData: () => {
      // Cache'den placeholder data al
      const cacheKey = `categories_${tip || 'all'}`;
      const cached = getCachedData<Category[]>(cacheKey);
      return cached || [];
    },
    refetchInterval: CACHE_CONFIG.refetchInterval,
    retry: (failureCount: number, error: unknown) => {
      if (isResourceError(error)) {
        return failureCount < 5; // Resource hatalarında daha fazla deneme
      }
      return failureCount < 3;
    },
    retryDelay: (attemptIndex: number, error: unknown) => {
      const baseDelay = 2000; // Daha uzun base delay
      const exponentialDelay = Math.min(baseDelay * Math.pow(2, attemptIndex), 30000);
      const jitter = Math.random() * 1000;
      return exponentialDelay + jitter;
    },
    onError: (error: unknown) => {
      console.error('❌ useCategories query error:', error);
      const friendlyMessage = getErrorMessage(error);
      console.error('🔴 User-friendly error:', friendlyMessage);
    },
    onSuccess: (data: unknown) => {
      console.log('✅ Categories loaded successfully:', data?.length || 0);
      // Başarılı fetch sonrası diğer kategorileri prefetch et
      if (data && data.length > 0) {
        setTimeout(prefetchOtherCategories, 100);
      }
    }
  });

  return {
    categories,
    isLoading,
    error,
    refetch,
    isFetching,
    isError,
    invalidateCache: debouncedInvalidate
  };
};

// Kategori CRUD işlemleri için mutation hook'ları
export const useCreateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (category: Omit<Category, "id" | "created_at" | "updated_at">) => {
      console.log('📁 Creating new category:', category);
      const { data, error } = await supabase
        .from("kategoriler")
        .insert([category])
        .select()
        .single();

      if (error) {
        console.error('❌ Category creation error:', error);
        throw error;
      }
      
      console.log('✅ Category created:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useUpdateCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Category> & { id: string }) => {
      console.log('📁 Updating category:', id, updates);
      const { data, error } = await supabase
        .from("kategoriler")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

      if (error) {
        console.error('❌ Category update error:', error);
        throw error;
      }
      
      console.log('✅ Category updated:', data);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

export const useDeleteCategory = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      console.log('📁 Deleting category:', id);
      const { error } = await supabase
        .from("kategoriler")
        .delete()
        .eq("id", id);

      if (error) {
        console.error('❌ Category deletion error:', error);
        throw error;
      }
      
      console.log('✅ Category deleted:', id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};

// Kategori sıralama güncelleme için özel hook
export const useUpdateCategoryOrder = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (categories: { id: string; sira_no: number }[]) => {
      console.log('📁 Updating category order:', categories);
      
      // Batch update için upsert kullan
      const updates = categories.map(cat => ({
        id: cat.id,
        sira_no: cat.sira_no
      }));
      
      const { data, error } = await supabase
        .from("kategoriler")
        .upsert(updates, { onConflict: 'id' })
        .select();

      if (error) {
        console.error('❌ Category order update error:', error);
        throw error;
      }
      
      console.log('✅ Category order updated:', data?.length || 0);
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });
};
// Supabase istemci yapılandırması - Optimize edilmiş versiyon
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';
import { memoryManager, connectionManager } from './utils';

// Ortam değişkenlerinden Supabase URL ve anon key'i al
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Debug: Ortam değişkenlerini kontrol et
console.log('🔍 Supabase Ortam Değişkenleri:');
console.log('VITE_SUPABASE_URL:', SUPABASE_URL);
console.log('VITE_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'TANIMSIZ');

// Ortam değişkenlerinin tanımlı olduğundan emin ol
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.error('❌ Supabase ortam değişkenleri eksik!');
  console.error('VITE_SUPABASE_URL:', SUPABASE_URL);
  console.error('VITE_SUPABASE_ANON_KEY:', SUPABASE_ANON_KEY);
  throw new Error('Supabase ortam değişkenleri (.env dosyasında) tanımlanmamış!');
}

// Connection ID generator
let connectionIdCounter = 0;
const generateConnectionId = () => `supabase-conn-${++connectionIdCounter}-${Date.now()}`;

// Supabase istemcisini optimize edilmiş ayarlarla oluştur
export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: localStorage,
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true // OAuth ve sosyal girişler için
  },
  global: {
    headers: {
      'X-Client-Info': 'kumlu-cam-kumlama', // API çağrılarında özel bilgi
      'Connection': 'keep-alive' // Bağlantıyı canlı tut
    },
    fetch: async (url, options = {}) => {
      const connectionId = generateConnectionId();
      const controller = memoryManager.createAbortController();
      
      // Connection tracking
      connectionManager.addConnection(connectionId);
      
      const timeoutId = memoryManager.setTimeout(() => {
        controller.abort('Request timeout');
        connectionManager.removeConnection(connectionId);
      }, 12000); // 12 saniye timeout (daha agresif)

      try {
        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
          headers: {
            ...options.headers,
            'Cache-Control': 'no-cache, no-store, must-revalidate',
            'Pragma': 'no-cache',
            'Connection': 'keep-alive',
            'Keep-Alive': 'timeout=5, max=100', // Connection pooling
            'X-Requested-With': 'XMLHttpRequest',
            'X-Connection-ID': connectionId
          },
          // Connection pooling ve performance ayarları
          keepalive: true,
          mode: 'cors',
          credentials: 'same-origin'
        });
        
        // Başarılı response'da connection'ı kaldır
        connectionManager.removeConnection(connectionId);
        return response;
      } catch (error: unknown) {
        // Hata durumunda da connection'ı kaldır
        connectionManager.removeConnection(connectionId);
        
        // AbortError durumunda özel hata fırlat
        if (error.name === 'AbortError') {
          const resourceError = new Error('ERR_INSUFFICIENT_RESOURCES');
          resourceError.name = 'ERR_INSUFFICIENT_RESOURCES';
          throw resourceError;
        }
        
        throw error;
      }
    }
  },
  db: {
    schema: 'public'
  },
  realtime: {
    params: {
      eventsPerSecond: 10 // Realtime event sınırlaması
    }
  }
});

// Supabase client cleanup fonksiyonu
export const cleanupSupabaseClient = () => {
  console.log('🧹 Supabase client cleanup başlatılıyor...');
  
  // Auth session'ı temizle
  supabase.auth.signOut({ scope: 'local' }).catch(error => {
    console.warn('⚠️ Auth signout failed during cleanup:', error);
  });
  
  console.log('✅ Supabase client cleanup tamamlandı');
};

// Cleanup task'ı memory manager'a ekle
memoryManager.addCleanupTask(cleanupSupabaseClient);

// Base URL'yi dışa aktar (diğer dosyalarda kullanım için)
export const SUPABASE_BASE_URL = SUPABASE_URL;

// Supabase istemcisini şu şekilde import edin:
// import { supabase } from "@/integrations/supabase/client";
// Supabase yardımcı fonksiyonları - Retry ve hata yönetimi
import { PostgrestError } from '@supabase/supabase-js';

// Resource cleanup için tip tanımları
interface CleanupManager {
  abortControllers: Set<AbortController>;
  intervals: Set<NodeJS.Timeout>;
  timeouts: Set<NodeJS.Timeout>;
  eventListeners: Map<EventTarget, Map<string, EventListener>>;
  connections: Map<string, unknown>;
  
  addAbortController(controller: AbortController): void;
  addInterval(intervalId: NodeJS.Timeout): void;
  addTimeout(timeoutId: NodeJS.Timeout): void;
  addEventListeners(element: EventTarget, events: Record<string, EventListener>): void;
  removeEventListeners(element: EventTarget, events: Record<string, EventListener>): void;
  addConnection(connectionId: string, connection: unknown): void;
  cleanup(): void;
}

// Retry mekanizması için tip tanımları
interface RetryOptions {
  maxRetries?: number;
  baseDelay?: number;
  maxDelay?: number;
  backoffFactor?: number;
}

// Exponential backoff ile retry mekanizması
export const withRetry = async <T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> => {
  const {
    maxRetries = 3,
    baseDelay = 1000,
    maxDelay = 10000,
    backoffFactor = 2
  } = options;

  let lastError: Error;
  
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation();
    } catch (error: unknown) {
      lastError = error as Error;
      
      // Son deneme ise hatayı fırlat
      if (attempt === maxRetries) {
        throw lastError;
      }
      
      // ERR_INSUFFICIENT_RESOURCES hatası için özel işlem
      if (isResourceError(error)) {
        console.warn(`🔄 Kaynak hatası nedeniyle yeniden deneniyor (${attempt + 1}/${maxRetries + 1}):`, error);
        
        // Exponential backoff hesaplama
        const delay = Math.min(
          baseDelay * Math.pow(backoffFactor, attempt),
          maxDelay
        );
        
        // Rastgele jitter ekle (thundering herd problemini önlemek için)
        const jitter = Math.random() * 0.1 * delay;
        const totalDelay = delay + jitter;
        
        console.log(`⏳ ${Math.round(totalDelay)}ms beklenecek...`);
        await sleep(totalDelay);
      } else {
        // Diğer hatalar için daha kısa bekleme
        await sleep(baseDelay * (attempt + 1));
      }
    }
  }
  
  throw lastError!;
};

// Hata kontrol fonksiyonları
export const isResourceError = (error: unknown): boolean => {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString() || '';
  const errorCode = error.code || error.status || '';
  const errorName = error.name || '';
  
  return (
    errorMessage.includes('ERR_INSUFFICIENT_RESOURCES') ||
    errorMessage.includes('net::ERR_INSUFFICIENT_RESOURCES') ||
    errorMessage.includes('insufficient resources') ||
    errorMessage.includes('resource limit') ||
    errorMessage.includes('too many requests') ||
    errorMessage.includes('quota exceeded') ||
    errorMessage.includes('rate limit') ||
    errorName === 'AbortError' ||
    errorCode === 'INSUFFICIENT_RESOURCES' ||
    errorCode === 429 ||
    errorCode === 503 ||
    errorCode === 507 || // Insufficient Storage
    errorCode === 508    // Loop Detected
  );
};

export const isNetworkError = (error: unknown): boolean => {
  if (!error) return false;
  
  const errorMessage = error.message || error.toString() || '';
  const errorCode = error.code || error.status || '';
  const errorName = error.name || '';
  
  return (
    errorMessage.includes('network') ||
    errorMessage.includes('fetch') ||
    errorMessage.includes('connection') ||
    errorMessage.includes('timeout') ||
    errorMessage.includes('ERR_NETWORK') ||
    errorMessage.includes('ERR_INTERNET_DISCONNECTED') ||
    errorName === 'NetworkError' ||
    errorName === 'TypeError' && errorMessage.includes('fetch') ||
    errorCode === 'NETWORK_ERROR' ||
    errorCode === 'FETCH_ERROR' ||
    errorCode === 0 // Network unreachable
  );
};

export const isTemporaryError = (error: unknown): boolean => {
  return isResourceError(error) || isNetworkError(error) || 
         error?.status >= 500 || error?.code >= 500;
};

export const isPermanentError = (error: unknown): boolean => {
  const errorCode = error?.code || error?.status || 0;
  return errorCode >= 400 && errorCode < 500 && errorCode !== 429;
};

// Supabase hatası kontrolü
export const isSupabaseError = (error: unknown): error is PostgrestError => {
  return error && typeof error === 'object' && 'code' in error && 'message' in error;
};

// Sleep fonksiyonu
export const sleep = (ms: number): Promise<void> => {
  return new Promise(resolve => setTimeout(resolve, ms));
};

// Gelişmiş request queue sistemi with deduplication
class RequestQueue {
  private queue: Array<{ id: string; request: () => Promise<unknown>; resolve: (value: unknown) => void; reject: (error: unknown) => void }> = [];
  private processing = false;
  private maxConcurrent = 5; // Artırıldı
  private currentRequests = 0;
  private pendingRequests = new Map<string, Promise<unknown>>();
  private requestCache = new Map<string, { data: unknown; timestamp: number; ttl: number }>();
  private requestStats = {
    total: 0,
    successful: 0,
    failed: 0,
    deduplicated: 0,
    cached: 0
  };

  // Request deduplication ile ekleme
  async add<T>(request: () => Promise<T>, options: {
    id?: string;
    priority?: 'high' | 'medium' | 'low';
    cacheTTL?: number;
    deduplicate?: boolean;
  } = {}): Promise<T> {
    const {
      id = this.generateRequestId(request.toString()),
      priority = 'medium',
      cacheTTL = 5 * 60 * 1000, // 5 dakika
      deduplicate = true
    } = options;

    this.requestStats.total++;

    // Cache kontrolü
    const cached = this.getFromCache(id);
    if (cached) {
      console.log('📦 Request cache hit:', id);
      this.requestStats.cached++;
      return cached;
    }

    // Deduplication kontrolü
    if (deduplicate && this.pendingRequests.has(id)) {
      console.log('🔄 Request deduplicated:', id);
      this.requestStats.deduplicated++;
      return this.pendingRequests.get(id) as Promise<T>;
    }

    const promise = new Promise<T>((resolve, reject) => {
      const queueItem = {
        id,
        request: async () => {
          try {
            console.log('🚀 Executing request:', id);
            const result = await request();
            
            // Cache'e kaydet
            this.setCache(id, result, cacheTTL);
            this.requestStats.successful++;
            
            resolve(result);
            return result;
          } catch (error) {
            console.error('❌ Request failed:', id, error);
            this.requestStats.failed++;
            reject(error);
            throw error;
          } finally {
            this.pendingRequests.delete(id);
          }
        },
        resolve,
        reject
      };

      // Priority'ye göre sırala
      if (priority === 'high') {
        this.queue.unshift(queueItem);
      } else if (priority === 'low') {
        this.queue.push(queueItem);
      } else {
        // Medium priority - ortaya ekle
        const midIndex = Math.floor(this.queue.length / 2);
        this.queue.splice(midIndex, 0, queueItem);
      }
    });

    if (deduplicate) {
      this.pendingRequests.set(id, promise as Promise<unknown>);
    }

    this.processQueue();
    return promise;
  }

  private generateRequestId(requestStr: string): string {
    // Basit hash fonksiyonu
    let hash = 0;
    for (let i = 0; i < requestStr.length; i++) {
      const char = requestStr.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 32bit integer'a çevir
    }
    return `req_${Math.abs(hash)}_${Date.now()}`;
  }

  private getFromCache<T>(id: string): T | null {
    const cached = this.requestCache.get(id);
    if (cached && Date.now() < cached.timestamp + cached.ttl) {
      return cached.data;
    }
    if (cached) {
      this.requestCache.delete(id);
    }
    return null;
  }

  private setCache(id: string, data: unknown, ttl: number): void {
    this.requestCache.set(id, {
      data,
      timestamp: Date.now(),
      ttl
    });
    
    // Cache temizliği (100 item'dan fazlaysa eski olanları sil)
    if (this.requestCache.size > 100) {
      const entries = Array.from(this.requestCache.entries());
      entries.sort((a, b) => a[1].timestamp - b[1].timestamp);
      const toDelete = entries.slice(0, 20); // En eski 20 item'ı sil
      toDelete.forEach(([key]) => this.requestCache.delete(key));
    }
  }

  private async processQueue() {
    if (this.processing || this.currentRequests >= this.maxConcurrent) {
      return;
    }

    this.processing = true;

    while (this.queue.length > 0 && this.currentRequests < this.maxConcurrent) {
      const queueItem = this.queue.shift();
      if (queueItem) {
        this.currentRequests++;
        queueItem.request().finally(() => {
          this.currentRequests--;
          this.processQueue();
        });
      }
    }

    this.processing = false;
  }

  // Queue durumu
  getStats() {
    return {
      ...this.requestStats,
      queueLength: this.queue.length,
      currentRequests: this.currentRequests,
      pendingRequests: this.pendingRequests.size,
      cacheSize: this.requestCache.size
    };
  }

  // Cache temizliği
  clearCache() {
    this.requestCache.clear();
    console.log('🗑️ Request cache cleared');
  }

  // Queue temizliği
  clearQueue() {
    this.queue.length = 0;
    this.pendingRequests.clear();
    console.log('🗑️ Request queue cleared');
  }
}

// Memory leak önleme ve cleanup yardımcıları
class MemoryManager {
  private static instance: MemoryManager;
  private cleanupTasks: Array<() => void> = [];
  private intervalIds: Set<NodeJS.Timeout> = new Set();
  private timeoutIds: Set<NodeJS.Timeout> = new Set();
  private abortControllers: Set<AbortController> = new Set();
  private eventListeners: Array<{ element: EventTarget; event: string; listener: EventListener }> = [];

  static getInstance(): MemoryManager {
    if (!MemoryManager.instance) {
      MemoryManager.instance = new MemoryManager();
    }
    return MemoryManager.instance;
  }

  // AbortController yönetimi
  createAbortController(): AbortController {
    const controller = new AbortController();
    this.abortControllers.add(controller);
    return controller;
  }

  // Interval yönetimi
  setInterval(callback: () => void, delay: number): NodeJS.Timeout {
    const id = setInterval(callback, delay);
    this.intervalIds.add(id);
    return id;
  }

  // Timeout yönetimi
  setTimeout(callback: () => void, delay: number): NodeJS.Timeout {
    const id = setTimeout(() => {
      callback();
      this.timeoutIds.delete(id);
    }, delay);
    this.timeoutIds.add(id);
    return id;
  }

  // Event listener yönetimi
  addEventListener(element: EventTarget, event: string, listener: EventListener): void {
    element.addEventListener(event, listener);
    this.eventListeners.push({ element, event, listener });
  }

  // Cleanup task ekleme
  addCleanupTask(task: () => void): void {
    this.cleanupTasks.push(task);
  }

  // Tüm kaynakları temizle
  cleanup(): void {
    console.log('🧹 Memory cleanup başlatılıyor...');

    // AbortController'ları iptal et
    this.abortControllers.forEach(controller => {
      if (!controller.signal.aborted) {
        controller.abort('Memory cleanup');
      }
    });
    this.abortControllers.clear();

    // Interval'ları temizle
    this.intervalIds.forEach(id => clearInterval(id));
    this.intervalIds.clear();

    // Timeout'ları temizle
    this.timeoutIds.forEach(id => clearTimeout(id));
    this.timeoutIds.clear();

    // Event listener'ları kaldır
    this.eventListeners.forEach(({ element, event, listener }) => {
      element.removeEventListener(event, listener);
    });
    this.eventListeners.length = 0;

    // Özel cleanup task'ları çalıştır
    this.cleanupTasks.forEach(task => {
      try {
        task();
      } catch (error) {
        console.warn('⚠️ Cleanup task failed:', error);
      }
    });
    this.cleanupTasks.length = 0;

    console.log('✅ Memory cleanup tamamlandı');
  }

  // Bellek kullanımı istatistikleri
  getMemoryStats() {
    return {
      abortControllers: this.abortControllers.size,
      intervals: this.intervalIds.size,
      timeouts: this.timeoutIds.size,
      eventListeners: this.eventListeners.length,
      cleanupTasks: this.cleanupTasks.length
    };
  }
}

// Connection cleanup yardımcıları
export const connectionManager = {
  // Aktif bağlantıları takip et
  activeConnections: new Set<string>(),
  
  // Bağlantı ekle
  addConnection(id: string): void {
    this.activeConnections.add(id);
    console.log('🔗 Connection added:', id, `(Total: ${this.activeConnections.size})`);
  },
  
  // Bağlantı kaldır
  removeConnection(id: string): void {
    this.activeConnections.delete(id);
    console.log('🔌 Connection removed:', id, `(Total: ${this.activeConnections.size})`);
  },
  
  // Tüm bağlantıları temizle
  clearAllConnections(): void {
    const count = this.activeConnections.size;
    this.activeConnections.clear();
    console.log('🧹 All connections cleared:', count);
  },
  
  // Bağlantı durumu
  getConnectionStats() {
    return {
      activeConnections: this.activeConnections.size,
      connections: Array.from(this.activeConnections)
    };
  }
};

// Memory manager instance
export const memoryManager = MemoryManager.getInstance();

// Global request queue instance
export const requestQueue = new RequestQueue();

// Sayfa kapatılırken cleanup
if (typeof window !== 'undefined') {
  const cleanup = () => {
    memoryManager.cleanup();
    requestQueue.clearQueue();
    requestQueue.clearCache();
    connectionManager.clearAllConnections();
  };

  memoryManager.addEventListener(window, 'beforeunload', cleanup);
  memoryManager.addEventListener(window, 'unload', cleanup);
  
  // Visibility change'de de cleanup yap
  memoryManager.addEventListener(document, 'visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
      // Sayfa gizlendiğinde hafif cleanup
      requestQueue.clearCache();
    }
  });
}

// Fallback veri stratejileri
export const getFallbackData = <T>(dataType: 'categories' | 'photos' | 'settings', defaultValue?: T): T => {
  const fallbackData = {
    categories: [],
    photos: [],
    settings: {}
  };
  
  return (defaultValue ?? fallbackData[dataType]) as T;
};

// Cache'den veri alma
export const getCachedData = <T>(key: string): T | null => {
  try {
    const cached = localStorage.getItem(`supabase_cache_${key}`);
    if (cached) {
      const parsed = JSON.parse(cached);
      const now = Date.now();
      if (parsed.expiry > now) {
        console.log('📦 Cache hit:', key);
        return parsed.data;
      } else {
        localStorage.removeItem(`supabase_cache_${key}`);
        console.log('🗑️ Cache expired:', key);
      }
    }
  } catch (error) {
    console.warn('⚠️ Cache read error:', error);
  }
  return null;
};

// Cache'e veri kaydetme
export const setCachedData = <T>(key: string, data: T, ttlMinutes: number = 30): void => {
  try {
    const cacheData = {
      data,
      expiry: Date.now() + (ttlMinutes * 60 * 1000)
    };
    localStorage.setItem(`supabase_cache_${key}`, JSON.stringify(cacheData));
    console.log('💾 Data cached:', key, `(TTL: ${ttlMinutes}m)`);
  } catch (error) {
    console.warn('⚠️ Cache write error:', error);
  }
};

// Gelişmiş fallback stratejisi
export const withFallback = async <T>(
  primaryFn: () => Promise<T>,
  fallbackFn?: () => Promise<T> | T,
  cacheKey?: string
): Promise<T> => {
  try {
    // Önce cache'den dene
    if (cacheKey) {
      const cached = getCachedData<T>(cacheKey);
      if (cached) {
        // Background'da primary function'ı çalıştır
        primaryFn().then(data => {
          setCachedData(cacheKey, data);
        }).catch(() => {
          console.log('🔄 Background refresh failed, keeping cache');
        });
        return cached;
      }
    }
    
    // Primary function'ı dene
    const result = await primaryFn();
    
    // Başarılıysa cache'e kaydet
    if (cacheKey && result) {
      setCachedData(cacheKey, result);
    }
    
    return result;
  } catch (error) {
    console.warn('⚠️ Primary function failed, trying fallback:', error);
    
    // Cache'den dene
    if (cacheKey) {
      const cached = getCachedData<T>(cacheKey);
      if (cached) {
        console.log('📦 Using cached data as fallback');
        return cached;
      }
    }
    
    // Fallback function'ı dene
    if (fallbackFn) {
      try {
        const fallbackResult = await fallbackFn();
        console.log('🔄 Fallback function succeeded');
        return fallbackResult;
      } catch (fallbackError) {
        console.error('❌ Fallback function also failed:', fallbackError);
      }
    }
    
    // Son çare olarak hata fırlat
    throw error;
  }
};

// Kullanıcı dostu hata mesajları
export const getErrorMessage = (error: unknown): string => {
  if (!error) return 'Bilinmeyen bir hata oluştu';
  
  if (isResourceError(error)) {
    return 'Sunucu kaynaklarında geçici bir sorun var. Lütfen birkaç saniye sonra tekrar deneyin.';
  }
  
  if (isNetworkError(error)) {
    return 'İnternet bağlantınızı kontrol edin ve tekrar deneyin.';
  }
  
  if (isSupabaseError(error)) {
    switch (error.code) {
      case 'PGRST116':
        return 'Veri bulunamadı.';
      case 'PGRST301':
        return 'Bu işlem için yetkiniz bulunmuyor.';
      case 'PGRST204':
        return 'İşlem başarıyla tamamlandı ancak veri döndürülmedi.';
      case 'PGRST102':
        return 'Geçersiz sorgu parametresi.';
      default:
        return `Veritabanı hatası: ${error.message}`;
    }
  }
  
  // HTTP status kodlarına göre mesajlar
  const statusCode = error.status || error.code;
  switch (statusCode) {
    case 400:
      return 'Geçersiz istek. Lütfen girdiğiniz bilgileri kontrol edin.';
    case 401:
      return 'Oturum süreniz dolmuş. Lütfen tekrar giriş yapın.';
    case 403:
      return 'Bu işlem için yetkiniz bulunmuyor.';
    case 404:
      return 'Aranan veri bulunamadı.';
    case 429:
      return 'Çok fazla istek gönderildi. Lütfen biraz bekleyin.';
    case 500:
      return 'Sunucu hatası. Lütfen daha sonra tekrar deneyin.';
    case 503:
      return 'Servis geçici olarak kullanılamıyor. Lütfen daha sonra tekrar deneyin.';
    default:
      return error.message || 'Beklenmeyen bir hata oluştu';
  }
};
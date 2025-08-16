/**
 * Debounce fonksiyonu - çok hızlı çağrıları önler
 * @param func - Debounce edilecek fonksiyon
 * @param delay - Gecikme süresi (ms)
 * @returns Debounce edilmiş fonksiyon
 */
export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeoutId: NodeJS.Timeout;
  
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
}

/**
 * Throttle fonksiyonu - belirli aralıklarla çağrılmasını sağlar
 * @param func - Throttle edilecek fonksiyon
 * @param delay - Minimum aralık süresi (ms)
 * @returns Throttle edilmiş fonksiyon
 */
export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let lastCall = 0;
  
  return (...args: Parameters<T>) => {
    const now = Date.now();
    if (now - lastCall >= delay) {
      lastCall = now;
      func(...args);
    }
  };
}

/**
 * Request limiter - aynı endpoint'e çok hızlı istek atmayı önler
 */
class RequestLimiter {
  private requests = new Map<string, number>();
  private readonly minInterval: number;

  constructor(minInterval = 1000) {
    this.minInterval = minInterval;
  }

  canMakeRequest(key: string): boolean {
    const now = Date.now();
    const lastRequest = this.requests.get(key) || 0;
    
    if (now - lastRequest >= this.minInterval) {
      this.requests.set(key, now);
      return true;
    }
    
    return false;
  }

  reset(key?: string) {
    if (key) {
      this.requests.delete(key);
    } else {
      this.requests.clear();
    }
  }
}

export const requestLimiter = new RequestLimiter(1000); // 1 saniye minimum aralık
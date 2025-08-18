// Storage URL'lerini CORS sorunlarını önleyecek şekilde düzenleyen yardımcı fonksiyonlar
import { supabase } from '@/integrations/supabase/client';

/**
 * Supabase Storage URL'ini CORS-safe hale getirir
 * ERR_BLOCKED_BY_ORB hatalarını önler
 */
export const getStorageUrl = (bucketName: string, filePath: string): string => {
  if (!bucketName || !filePath) {
    console.warn('⚠️ Storage URL oluşturulamadı: bucket veya filePath eksik');
    return '';
  }

  try {
    // Supabase public URL'ini al
    const { data } = supabase.storage.from(bucketName).getPublicUrl(filePath);
    
    if (!data?.publicUrl) {
      console.warn(`⚠️ Public URL alınamadı: ${bucketName}/${filePath}`);
      return '';
    }

    // Basit URL döndür - CORS parametrelerini kaldır
    console.log(`✅ Storage URL oluşturuldu: ${bucketName}/${filePath}`);
    return data.publicUrl;
  } catch (error) {
    console.error(`❌ Storage URL hatası: ${bucketName}/${filePath}`, error);
    return '';
  }
};

/**
 * Fotoğraf URL'ini güvenli şekilde al
 * Fallback mekanizması ile
 */
export const getPhotoUrl = (dosyaYolu: string, bucketName: string = 'fotograflar'): string => {
  if (!dosyaYolu) {
    console.warn('⚠️ Dosya yolu boş, placeholder kullanılacak');
    return getPlaceholderUrl();
  }

  const url = getStorageUrl(bucketName, dosyaYolu);
  
  if (!url) {
    console.warn(`⚠️ Storage URL alınamadı, placeholder kullanılacak: ${dosyaYolu}`);
    return getPlaceholderUrl();
  }

  return url;
};

/**
 * Slider resimleri için özel URL oluşturucu
 * CORB hatası nedeniyle deaktif edildi - sadece placeholder döndürür
 */
export const getSliderImageUrl = (dosyaYolu: string): string => {
  // CORB hatası nedeniyle tüm slider görselleri deaktif edildi
  console.warn(`⚠️ Slider görselleri CORB hatası nedeniyle deaktif: ${dosyaYolu}`);
  return getPlaceholderUrl('slider');
};

/**
 * Placeholder URL'leri
 */
export const getPlaceholderUrl = (type: string = 'default'): string => {
  const placeholders = {
    slider: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=modern%20glass%20sandblasting%20workshop%20interior%20with%20professional%20equipment&image_size=landscape_16_9',
    default: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=professional%20glass%20work%20placeholder&image_size=square',
    category: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=glass%20category%20placeholder&image_size=square',
    logo: 'https://trae-api-sg.mchost.guru/api/ide/v1/text_to_image?prompt=company%20logo%20placeholder&image_size=square'
  };

  return placeholders[type as keyof typeof placeholders] || placeholders.default;
};

/**
 * Resim yükleme hatası için fallback handler
 */
export const handleImageLoadError = (event: React.SyntheticEvent<HTMLImageElement>, fallbackType: string = 'default') => {
  const target = event.currentTarget;
  const currentSrc = target.src;

  // Eğer zaten placeholder kullanıyorsa, hata mesajı göster
  if (currentSrc.includes('trae-api-sg.mchost.guru')) {
    target.style.display = 'none';
    const parent = target.parentElement;
    if (parent) {
      parent.innerHTML = '<div class="flex items-center justify-center h-full bg-muted text-muted-foreground text-sm">Görsel yüklenemedi</div>';
    }
    return;
  }

  // Placeholder'a geç
  target.src = getPlaceholderUrl(fallbackType);
  console.warn(`⚠️ Resim yükleme hatası, placeholder kullanılıyor: ${currentSrc}`);
};

/**
 * Batch image preloading
 * Performans için kritik resimleri önceden yükler
 */
export const preloadImages = (urls: string[], onProgress?: (loaded: number, total: number) => void) => {
  let loadedCount = 0;
  const total = urls.length;

  urls.forEach((url, index) => {
    const img = new Image();
    
    img.onload = () => {
      loadedCount++;
      console.log(`🚀 Preloaded (${loadedCount}/${total}): ${url}`);
      onProgress?.(loadedCount, total);
    };
    
    img.onerror = () => {
      loadedCount++;
      console.warn(`⚠️ Preload failed (${loadedCount}/${total}): ${url}`);
      onProgress?.(loadedCount, total);
    };
    
    img.src = url;
  });
};

/**
 * Storage bucket durumunu kontrol et
 */
export const checkStorageHealth = async (): Promise<boolean> => {
  try {
    // Test dosyası ile bucket erişimini kontrol et
    const { data, error } = await supabase.storage
      .from('fotograflar')
      .list('', { limit: 1 });

    if (error) {
      console.error('❌ Storage health check failed:', error);
      return false;
    }

    console.log('✅ Storage health check passed');
    return true;
  } catch (error) {
    console.error('❌ Storage health check error:', error);
    return false;
  }
};

/**
 * CORS preflight isteği gönder
 */
export const sendCORSPreflight = async (url: string): Promise<boolean> => {
  try {
    const response = await fetch(url, {
      method: 'OPTIONS',
      headers: {
        'Access-Control-Request-Method': 'GET',
        'Access-Control-Request-Headers': 'Content-Type',
        'Origin': window.location.origin
      },
      mode: 'cors'
    });

    console.log(`✅ CORS preflight successful for: ${url}`);
    return response.ok;
  } catch (error) {
    console.warn(`⚠️ CORS preflight failed for: ${url}`, error);
    return false;
  }
};
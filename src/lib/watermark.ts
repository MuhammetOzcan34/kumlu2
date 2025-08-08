/**
 * watermark.ts
 * Fotoğraflara filigran ekleme işlemlerini yöneten modül
 */

import { SUPABASE_BASE_URL } from '@/integrations/supabase/client';

/**
 * Filigran ekleme ayarları
 */
interface WatermarkOptions {
  /** Filigran boyutu (0-1 arası, orijinal görüntünün yüzdesi) */
  size?: number;
  /** Filigran opaklığı (0-1 arası) */
  opacity?: number;
  /** Filigran açısı (derece cinsinden) */
  angle?: number;
  /** Filigran pozisyonu */
  position?: 'center' | 'top-left' | 'top-right' | 'bottom-left' | 'bottom-right' | 'pattern';
  /** Pattern için satır ve sütun sayısı */
  patternRows?: number;
  patternCols?: number;
}

/**
 * Logo yükleme durumu
 */
interface LogoLoadResult {
  success: boolean;
  image?: HTMLImageElement;
  error?: Error;
}

/**
 * Varsayılan filigran ayarları - Shutterstock tarzı pattern
 */
const DEFAULT_OPTIONS: WatermarkOptions = {
  size: 0.15,      // Görüntünün %15'i kadar
  opacity: 0.25,   // %25 opaklık
  angle: -30,      // -30 derece açı
  position: 'pattern', // Fotoğraf genelinde dağılım
  patternRows: 4,  // 4 satır
  patternCols: 3   // 3 sütun
};

/**
 * Optimize edilmiş logo yükleme fonksiyonu - Güçlü fallback sistemi
 * @param logoUrl Logo URL'si (opsiyonel, belirtilmezse yerel logo kullanılır)
 * @returns Logo yükleme sonucu
 */
export const loadLogo = (logoUrl?: string): Promise<LogoLoadResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous'; // CORS hatalarını önlemek için kritik

    const primaryUrl = logoUrl && logoUrl.trim() ? logoUrl : '/default-logo.svg';
    const fallbackUrl = '/default-logo.svg';

    img.onload = () => {
      console.log(`✅ Logo başarıyla yüklendi: ${img.src}`);
      resolve({ success: true, image: img });
    };

    img.onerror = () => {
      console.warn(`⚠️ Birincil logo yüklenemedi: ${primaryUrl}. Fallback deniyor...`);
      // Birincil URL başarısız olursa, fallback'i dene
      if (img.src !== fallbackUrl) {
        img.src = fallbackUrl;
      } else {
        // Fallback de başarısız olursa, hata döndür
        console.error(`❌ Fallback logo da yüklenemedi: ${fallbackUrl}`);
        resolve({ success: false, error: new Error(`Logo yüklenemedi: ${fallbackUrl}`) });
      }
    };

    // Yüklemeyi başlat
    img.src = primaryUrl;
    console.log(`🔄 Logo yükleniyor: ${img.src}`);
  });
};

/**
 * Bir görüntüye filigran ekler - Shutterstock tarzı pattern desteği
 * @param canvas Hedef canvas
 * @param ctx Canvas bağlamı
 * @param logoImage Logo görüntüsü
 * @param options Filigran ayarları
 */
export const applyWatermark = (
  canvas: HTMLCanvasElement,
  ctx: CanvasRenderingContext2D,
  logoImage: HTMLImageElement,
  options: WatermarkOptions = {}
): void => {
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  
  // Logo boyutunu hesapla
  const logoSize = Math.min(canvasWidth, canvasHeight) * (opts.size || 0.15);
  const logoWidth = logoSize;
  const logoHeight = (logoImage.height / logoImage.width) * logoSize;
  
  // Opaklık ve açı ayarları
  ctx.globalAlpha = opts.opacity || 0.25;
  
  if (opts.position === 'pattern') {
    // Pattern filigran - Shutterstock tarzı
    const rows = opts.patternRows || 4;
    const cols = opts.patternCols || 3;
    
    const stepX = canvasWidth / (cols + 1);
    const stepY = canvasHeight / (rows + 1);
    
    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= cols; col++) {
        const x = stepX * col - logoWidth / 2;
        const y = stepY * row - logoHeight / 2;
        
        ctx.save();
        ctx.translate(x + logoWidth / 2, y + logoHeight / 2);
        ctx.rotate((opts.angle || -30) * Math.PI / 180);
        ctx.drawImage(logoImage, -logoWidth / 2, -logoHeight / 2, logoWidth, logoHeight);
        ctx.restore();
      }
    }
  } else {
    // Tek pozisyon filigran
    let x, y;
    
    switch (opts.position) {
      case 'top-left':
        x = 20;
        y = 20;
        break;
      case 'top-right':
        x = canvasWidth - logoWidth - 20;
        y = 20;
        break;
      case 'bottom-left':
        x = 20;
        y = canvasHeight - logoHeight - 20;
        break;
      case 'bottom-right':
        x = canvasWidth - logoWidth - 20;
        y = canvasHeight - logoHeight - 20;
        break;
      case 'center':
      default:
        x = (canvasWidth - logoWidth) / 2;
        y = (canvasHeight - logoHeight) / 2;
        break;
    }
    
    ctx.save();
    ctx.translate(x + logoWidth / 2, y + logoHeight / 2);
    ctx.rotate((opts.angle || -30) * Math.PI / 180);
    ctx.drawImage(logoImage, -logoWidth / 2, -logoHeight / 2, logoWidth, logoHeight);
    ctx.restore();
  }
  
  // Opaklığı sıfırla
  ctx.globalAlpha = 1.0;
};

/**
 * Bir görüntüyü yeniden boyutlandırır ve isteğe bağlı olarak filigran ekler
 * @param file Görüntü dosyası
 * @param logoImage Logo görüntüsü (opsiyonel)
 * @param maxWidth Maksimum genişlik
 * @param maxHeight Maksimum yükseklik
 * @param watermarkOptions Filigran ayarları
 * @returns İşlenmiş görüntü blob'u
 */
export const processImage = async (
  file: File,
  logoImage?: HTMLImageElement | null,
  maxWidth: number = 1920,
  maxHeight: number = 1080,
  watermarkOptions: WatermarkOptions = {}
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      try {
        // Canvas oluştur
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Canvas context alınamadı');
        }
        
        // Boyutları hesapla (aspect ratio korunarak)
        let { width, height } = img;
        
        if (width > maxWidth || height > maxHeight) {
          const ratio = Math.min(maxWidth / width, maxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Görüntüyü çiz
        ctx.drawImage(img, 0, 0, width, height);
        
        // Filigran ekle (logo varsa)
        if (logoImage) {
          console.log('🎨 Filigran ekleniyor...');
          applyWatermark(canvas, ctx, logoImage, watermarkOptions);
          console.log('✅ Filigran başarıyla eklendi');
        } else {
          console.log('ℹ️ Logo olmadığı için filigran eklenmiyor');
        }
        
        // Blob'a dönüştür
        canvas.toBlob(
          (blob) => {
            if (blob) {
              console.log('✅ Görüntü işleme tamamlandı:', {
                originalSize: file.size,
                processedSize: blob.size,
                dimensions: `${width}x${height}`,
                hasWatermark: !!logoImage
              });
              resolve(blob);
            } else {
              reject(new Error('Blob oluşturulamadı'));
            }
          },
          'image/jpeg',
          0.9 // Kalite
        );
      } catch (error) {
        console.error('❌ Görüntü işleme hatası:', error);
        reject(error);
      }
    };
    
    img.onerror = () => {
      reject(new Error('Görüntü yüklenemedi'));
    };
    
    img.src = URL.createObjectURL(file);
  });
};

/**
 * Supabase ayarlarından filigran konfigürasyonunu alır
 */
/**
 * Supabase ayarlarından filigran konfigürasyonunu alır
 */
export const getWatermarkConfig = async () => {
  const { data, error } = await supabase
    .from('ayarlar') // 'settings' yerine 'ayarlar'
    .select('anahtar, deger')
    .in('anahtar', ['watermark_enabled', 'watermark_logo_url', 'watermark_opacity', 'watermark_size', 'watermark_position']);

  if (error) {
    console.error('Filigran ayarları alınamadı:', error);
    return null;
  }

  const config: any = {};
  data?.forEach(setting => {
    config[setting.anahtar] = setting.deger;
  });

  return {
    enabled: config.watermark_enabled === 'true',
    logoUrl: config.watermark_logo_url || '',
    opacity: parseFloat(config.watermark_opacity || '0.25'),
    size: parseFloat(config.watermark_size || '0.15'),
    position: config.watermark_position || 'pattern'
  };
};

/**
 * Filigran logosu yükleme fonksiyonu - Watermark klasöründen
 */
export const loadWatermarkLogo = async (): Promise<LogoLoadResult> => {
  try {
    const config = await getWatermarkConfig();
    
    if (!config?.enabled) {
      return { success: false, error: new Error('Filigran devre dışı') };
    }

    let logoUrl = config.logoUrl;
    
    // Eğer logo URL'si yoksa, watermark klasöründen varsayılan logoyu al
    if (!logoUrl) {
      const { data } = await supabase.storage
        .from('fotograflar')
        .getPublicUrl('watermark/watermark-logo.png');
      logoUrl = data.publicUrl;
    }

    return loadLogo(logoUrl);
  } catch (error) {
    console.error('Filigran logosu yüklenirken hata:', error);
    return { success: false, error: error as Error };
  }
};

/**
 * Filigran ile görüntü işleme fonksiyonu
 */
export const processImageWithWatermark = async (
  file: File,
  maxWidth: number = 1920,
  maxHeight: number = 1080
): Promise<Blob> => {
  try {
    const config = await getWatermarkConfig();
    
    if (!config?.enabled) {
      // Filigran devre dışıysa sadece yeniden boyutlandır
      return processImage(file, null, maxWidth, maxHeight);
    }

    const logoResult = await loadWatermarkLogo();
    
    if (!logoResult.success || !logoResult.image) {
      console.warn('Filigran logosu yüklenemedi, filigransız işleniyor');
      return processImage(file, null, maxWidth, maxHeight);
    }

    const watermarkOptions = {
      size: config.size,
      opacity: config.opacity,
      position: config.position as any,
      angle: -30,
      patternRows: 4,
      patternCols: 3
    };

    return processImage(file, logoResult.image, maxWidth, maxHeight, watermarkOptions);
  } catch (error) {
    console.error('Filigran işleme hatası:', error);
    // Hata durumunda filigransız işle
    return processImage(file, null, maxWidth, maxHeight);
  }
};

// Geriye uyumluluk için eski fonksiyonları yeni fonksiyonlara yönlendir
export const loadLogoSafe = loadWatermarkLogo;
/**
 * watermark.ts
 * Fotoğraflara filigran ekleme ve gelişmiş optimizasyon işlemlerini yöneten modül
 */

import { supabase } from '@/integrations/supabase/client';

/**
 * Logo cache sistemi - Aynı logo için tekrar yükleme yapmaz
 */
interface LogoCache {
  [key: string]: {
    image: HTMLImageElement;
    timestamp: number;
  };
}

const logoCache: LogoCache = {};
const CACHE_DURATION = 30 * 60 * 1000; // 30 dakika cache süresi

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
 * Gelişmiş görüntü optimizasyon ayarları
 */
interface OptimizationSettings {
  maxWidth: number;
  maxHeight: number;
  quality: number;
  format: 'jpeg' | 'webp';
  compressionLevel: 'low' | 'medium' | 'high';
}

/**
 * Varsayılan filigran ayarları - Shutterstock tarzı pattern
 */
const DEFAULT_OPTIONS: WatermarkOptions = {
  size: 0.08,      // Görüntünün %8'i kadar (daha küçük ve profesyonel)
  opacity: 0.15,   // %15 opaklık (daha şeffaf)
  angle: -30,      // -30 derece açı
  position: 'pattern', // Fotoğraf genelinde dağılım
  patternRows: 3,  // 3 satır (yukarıdan aşağı)
  patternCols: 4   // 4 sütun (soldan sağa)
};

/**
 * Fotoğraf boyutuna göre optimizasyon ayarlarını belirler - Akıllı Boyutlandırma
 * @param originalWidth Orijinal genişlik
 * @param originalHeight Orijinal yükseklik
 * @returns Optimizasyon ayarları
 */
const getOptimizationSettings = (originalWidth: number, originalHeight: number): OptimizationSettings => {
  const totalPixels = originalWidth * originalHeight;
  const aspectRatio = originalWidth / originalHeight;
  
  // Çok büyük fotoğraflar (8MP+) - Ultra agresif sıkıştırma
  if (totalPixels > 8000000) {
    return {
      maxWidth: aspectRatio > 1.5 ? 1200 : 1000, // Daha da küçük boyutlar
      maxHeight: aspectRatio < 0.7 ? 1200 : 800,
      quality: 0.60, // Çok düşük kalite ama hala kabul edilebilir
      format: 'jpeg',
      compressionLevel: 'high'
    };
  }
  
  // Büyük fotoğraflar (4-8MP) - Çok agresif sıkıştırma
  if (totalPixels > 4000000) {
    return {
      maxWidth: aspectRatio > 1.5 ? 1000 : 900,
      maxHeight: aspectRatio < 0.7 ? 1000 : 700,
      quality: 0.65, // Düşük kalite
      format: 'jpeg',
      compressionLevel: 'high'
    };
  }
  
  // Orta boyut fotoğraflar (2-4MP) - Agresif sıkıştırma
  if (totalPixels > 2000000) {
    return {
      maxWidth: aspectRatio > 1.5 ? 900 : 800,
      maxHeight: aspectRatio < 0.7 ? 900 : 650,
      quality: 0.70, // Orta-düşük kalite
      format: 'jpeg',
      compressionLevel: 'high'
    };
  }
  
  // Küçük fotoğraflar (2MP altı) - Orta sıkıştırma
  return {
    maxWidth: aspectRatio > 1.5 ? 800 : 600,
    maxHeight: aspectRatio < 0.7 ? 800 : 500,
    quality: 0.75, // Orta kalite
    format: 'jpeg',
    compressionLevel: 'medium'
  };
};

/**
 * Cache'den eski logoları temizler
 */
const cleanExpiredCache = (): void => {
  const now = Date.now();
  Object.keys(logoCache).forEach(key => {
    if (now - logoCache[key].timestamp > CACHE_DURATION) {
      delete logoCache[key];
      console.log(`🗑️ Cache'den eski logo temizlendi: ${key}`);
    }
  });
};

/**
 * Optimize edilmiş logo yükleme fonksiyonu - Cache sistemi ile
 * @param logoUrl Logo URL'si (opsiyonel, belirtilmezse yerel logo kullanılır)
 * @returns Logo yükleme sonucu
 */
export const loadLogo = (logoUrl?: string): Promise<LogoLoadResult> => {
  return new Promise((resolve) => {
    if (!logoUrl || !logoUrl.trim()) {
      resolve({ success: false, error: new Error('Logo URL boş') });
      return;
    }
    
    // Cache temizliği
    cleanExpiredCache();
    
    // Cache'de var mı kontrol et
    const cacheKey = logoUrl;
    if (logoCache[cacheKey]) {
      console.log(`📋 Logo cache'den alındı: ${logoUrl}`);
      resolve({ success: true, image: logoCache[cacheKey].image });
      return;
    }
    
    const img = new Image();
    img.crossOrigin = 'anonymous'; // CORS hatalarını önlemek için kritik

    img.onload = () => {
      console.log(`✅ Logo başarıyla yüklendi ve cache'e eklendi: ${img.src}`);
      // Cache'e ekle
      logoCache[cacheKey] = {
        image: img,
        timestamp: Date.now()
      };
      resolve({ success: true, image: img });
    };

    img.onerror = () => {
      console.error(`❌ Logo yüklenemedi: ${logoUrl}`);
      resolve({ success: false, error: new Error(`Logo yüklenemedi: ${logoUrl}`) });
    };

    // Yüklemeyi başlat
    img.src = logoUrl;
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
  
  // Logo boyutunu fotoğraf boyutuna göre dinamik hesapla
  const baseSize = Math.min(canvasWidth, canvasHeight);
  const logoSize = baseSize * (opts.size || 0.08);
  
  // Logo aspect ratio'sunu koru
  const logoAspectRatio = logoImage.width / logoImage.height;
  let logoWidth, logoHeight;
  
  if (logoAspectRatio > 1) {
    // Yatay logo
    logoWidth = logoSize;
    logoHeight = logoSize / logoAspectRatio;
  } else {
    // Dikey logo
    logoHeight = logoSize;
    logoWidth = logoSize * logoAspectRatio;
  }
  
  // Opaklık ayarı
  ctx.globalAlpha = opts.opacity || 0.15;
  
  if (opts.position === 'pattern') {
    // Shutterstock tarzı Pattern filigran - Doğru sütun/satır dağılımı
    const rows = opts.patternRows || 3; // 3 satır (yukarıdan aşağı)
    const cols = opts.patternCols || 4; // 4 sütun (soldan sağa)
    
    // Dinamik kenar boşluğu hesaplama - fotoğraf boyutuna göre
    const marginRatioX = canvasWidth > canvasHeight ? 0.08 : 0.12; // Yatay fotoğraflarda daha az boşluk
    const marginRatioY = canvasHeight > canvasWidth ? 0.08 : 0.12; // Dikey fotoğraflarda daha az boşluk
    
    const marginX = canvasWidth * marginRatioX;
    const marginY = canvasHeight * marginRatioY;
    
    // Kullanılabilir alan
    const availableWidth = canvasWidth - (2 * marginX);
    const availableHeight = canvasHeight - (2 * marginY);
    
    // Logo arası mesafeleri hesapla - eşit dağılım
    const stepX = availableWidth / (cols - 1); // Sütunlar arası mesafe
    const stepY = availableHeight / (rows - 1); // Satırlar arası mesafe
    
    // Pattern döşeme - 4 sütun x 3 satır
    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        // Logo pozisyonunu hesapla
        let x, y;
        
        if (cols === 1) {
          x = marginX + (availableWidth / 2) - logoWidth / 2;
        } else {
          x = marginX + (stepX * col) - logoWidth / 2;
        }
        
        if (rows === 1) {
          y = marginY + (availableHeight / 2) - logoHeight / 2;
        } else {
          y = marginY + (stepY * row) - logoHeight / 2;
        }
        
        // Sınırları kontrol et
        if (x >= 0 && y >= 0 && 
            x + logoWidth <= canvasWidth && 
            y + logoHeight <= canvasHeight) {
          
          ctx.save();
          ctx.translate(x + logoWidth / 2, y + logoHeight / 2);
          ctx.rotate((opts.angle || -30) * Math.PI / 180);
          ctx.drawImage(logoImage, -logoWidth / 2, -logoHeight / 2, logoWidth, logoHeight);
          ctx.restore();
        }
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
 * Gelişmiş görüntü işleme fonksiyonu - Akıllı optimizasyon ile
 * @param file Görüntü dosyası
 * @param logoImage Logo görüntüsü (opsiyonel)
 * @param maxWidth Maksimum genişlik (opsiyonel - otomatik hesaplanır)
 * @param maxHeight Maksimum yükseklik (opsiyonel - otomatik hesaplanır)
 * @param watermarkOptions Filigran ayarları
 * @returns İşlenmiş görüntü blob'u
 */
export const processImage = async (
  file: File,
  logoImage?: HTMLImageElement | null,
  maxWidth?: number,
  maxHeight?: number,
  watermarkOptions: WatermarkOptions = {}
): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const startTime = performance.now();
    const img = new Image();
    
    img.onload = () => {
      try {
        // Canvas oluştur
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          throw new Error('Canvas context alınamadı');
        }
        
        // Akıllı optimizasyon ayarlarını belirle
        const optimization = getOptimizationSettings(img.width, img.height);
        const finalMaxWidth = maxWidth || optimization.maxWidth;
        const finalMaxHeight = maxHeight || optimization.maxHeight;
        
        console.log('🎯 Akıllı optimizasyon ayarları:', {
          original: `${img.width}x${img.height}`,
          target: `${finalMaxWidth}x${finalMaxHeight}`,
          quality: optimization.quality,
          compressionLevel: optimization.compressionLevel,
          totalPixels: (img.width * img.height / 1000000).toFixed(1) + 'MP'
        });
        
        // Boyutları hesapla (aspect ratio korunarak)
        let { width, height } = img;
        
        if (width > finalMaxWidth || height > finalMaxHeight) {
          const ratio = Math.min(finalMaxWidth / width, finalMaxHeight / height);
          width *= ratio;
          height *= ratio;
        }
        
        canvas.width = width;
        canvas.height = height;
        
        // Performans İyileştirmesi: High-quality image smoothing
        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        
        // Gelişmiş canvas ayarları
        if (optimization.compressionLevel === 'high') {
          // Yüksek sıkıştırma için daha agresif smoothing
          ctx.filter = 'blur(0.5px)';
        }
        
        // Görüntüyü çiz
        ctx.drawImage(img, 0, 0, width, height);
        
        // Filter'ı temizle
        ctx.filter = 'none';
        
        // Filigran ekle (logo varsa)
        if (logoImage) {
          console.log('🎨 Filigran ekleniyor...');
          applyWatermark(canvas, ctx, logoImage, watermarkOptions);
          console.log('✅ Filigran başarıyla eklendi');
        } else {
          console.log('ℹ️ Logo olmadığı için filigran eklenmiyor');
        }
        
        // Blob'a dönüştür - Dinamik kalite ile
        canvas.toBlob(
          (blob) => {
            if (blob) {
              const endTime = performance.now();
              const processingTime = (endTime - startTime).toFixed(1);
              const compressionRatio = ((file.size - blob.size) / file.size * 100).toFixed(1);
              const sizeMB = (blob.size / 1024 / 1024).toFixed(2);
              const originalSizeMB = (file.size / 1024 / 1024).toFixed(2);
              
              // Detaylı Loglama: Sıkıştırma oranı ve boyut bilgileri
              console.log('✅ Gelişmiş görüntü işleme tamamlandı:', {
                originalSize: `${originalSizeMB} MB`,
                processedSize: `${sizeMB} MB`,
                compressionRatio: `${compressionRatio}%`,
                dimensions: `${img.width}x${img.height} → ${width}x${height}`,
                quality: optimization.quality,
                compressionLevel: optimization.compressionLevel,
                processingTime: `${processingTime}ms`,
                hasWatermark: !!logoImage,
                galeriOptimized: true // Galeri Uyumluluğu işareti
              });
              
              resolve(blob);
            } else {
              reject(new Error('Blob oluşturulamadı'));
            }
          },
          'image/jpeg',
          optimization.quality // Dinamik Kalite
        );
      } catch (error) {
        console.error('❌ Gelişmiş görüntü işleme hatası:', error);
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
export const getWatermarkConfig = async () => {
  const { data, error } = await supabase
    .from('ayarlar') // 'settings' yerine 'ayarlar'
    .select('anahtar, deger')
    .in('anahtar', [
      'watermark_enabled', 
      'watermark_logo_url', 
      'watermark_opacity', 
      'watermark_size', 
      'watermark_position',
      'watermark_pattern_rows',
      'watermark_pattern_cols',
      'watermark_angle'
    ]);

  if (error) {
    console.error('Filigran ayarları alınamadı:', error);
    return null;
  }

  const config: Record<string, string> = {};
  data?.forEach(setting => {
    config[setting.anahtar] = setting.deger;
  });

  return {
    enabled: config.watermark_enabled === 'true',
    logoUrl: config.watermark_logo_url || '',
    opacity: parseFloat(config.watermark_opacity || '0.15'),
    size: parseFloat(config.watermark_size || '0.08'),
    position: config.watermark_position || 'pattern',
    patternRows: parseInt(config.watermark_pattern_rows || '3'),
    patternCols: parseInt(config.watermark_pattern_cols || '4'),
    angle: parseFloat(config.watermark_angle || '-30')
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
    
    // Önce ayarlardan watermark logo URL'sini kontrol et
    if (logoUrl && logoUrl.trim()) {
      // Eğer relative path ise, Supabase storage URL'sine çevir
      if (!logoUrl.startsWith('http')) {
        const { data } = await supabase.storage
          .from('fotograflar')
          .getPublicUrl(logoUrl);
        logoUrl = data.publicUrl;
      }
      
      const result = await loadLogo(logoUrl);
      if (result.success) {
        return result;
      }
    }
    
    // Watermark klasöründen varsayılan logoyu dene
    const { data } = await supabase.storage
      .from('fotograflar')
      .getPublicUrl('watermark/watermark-logo.png');
    
    const fallbackResult = await loadLogo(data.publicUrl);
    if (fallbackResult.success) {
      return fallbackResult;
    }
    
    // Firma logosu ayarından dene
    const firmaLogoConfig = await supabase
      .from('ayarlar')
      .select('deger')
      .eq('anahtar', 'firma_logo_url')
      .single();
    
    if (firmaLogoConfig.data?.deger) {
      let firmaLogoUrl = firmaLogoConfig.data.deger;
      if (!firmaLogoUrl.startsWith('http')) {
        const { data: firmaLogoData } = await supabase.storage
          .from('fotograflar')
          .getPublicUrl(firmaLogoUrl);
        firmaLogoUrl = firmaLogoData.publicUrl;
      }
      
      const firmaResult = await loadLogo(firmaLogoUrl);
      if (firmaResult.success) {
        return firmaResult;
      }
    }
    
    // Son çare olarak hata döndür (default-logo.svg kullanma)
    return { success: false, error: new Error('Watermark logosu bulunamadı') };
    
  } catch (error) {
    console.error('Filigran logosu yüklenirken hata:', error);
    return { success: false, error: error as Error };
  }
};

/**
 * Gelişmiş filigran ile görüntü işleme fonksiyonu
 */
export const processImageWithWatermark = async (
  file: File,
  maxWidth?: number,
  maxHeight?: number
): Promise<Blob> => {
  try {
    const config = await getWatermarkConfig();
    
    if (!config?.enabled) {
      console.log('Filigran devre dışı, gelişmiş optimizasyon ile işleme devam ediliyor');
      return processImage(file, null, maxWidth, maxHeight);
    }

    const logoResult = await loadWatermarkLogo();
    if (!logoResult.success || !logoResult.image) {
      console.warn('Logo yüklenemedi, gelişmiş optimizasyon ile filigransız işleme devam ediliyor');
      return processImage(file, null, maxWidth, maxHeight);
    }

    return processImage(
      file,
      logoResult.image,
      maxWidth,
      maxHeight,
      {
        size: config.size,
        opacity: config.opacity,
        position: config.position as WatermarkPosition,
        angle: config.angle,
        patternRows: config.patternRows,
        patternCols: config.patternCols
      }
    );
  } catch (error) {
    console.error('Gelişmiş filigran işleme hatası:', error);
    // Hata durumunda gelişmiş optimizasyon ile filigransız işleme devam et
    return processImage(file, null, maxWidth, maxHeight);
  }
};

// Geriye uyumluluk için eski fonksiyonları yeni fonksiyonlara yönlendir
export const loadLogoSafe = loadWatermarkLogo;
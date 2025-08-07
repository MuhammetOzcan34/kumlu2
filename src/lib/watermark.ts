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
 * Güçlü fallback sistemi ile logo yükleme fonksiyonu
 * @param logoUrl Logo URL'si (opsiyonel, belirtilmezse yerel logo kullanılır)
 * @returns Logo yükleme sonucu
 */
export const loadLogo = async (logoUrl?: string): Promise<LogoLoadResult> => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      let attemptCount = 0;
      const maxAttempts = 3;

      const tryLoad = (url: string, isLastAttempt: boolean = false) => {
        attemptCount++;
        console.log(`🔄 Logo yükleme denemesi ${attemptCount}/${maxAttempts}:`, url);
        
        img.onload = () => {
          console.log('✅ Logo başarıyla yüklendi:', {
            width: img.width,
            height: img.height,
            src: img.src,
            attempt: attemptCount
          });
          resolve({ success: true, image: img });
        };

        img.onerror = (error) => {
          console.error('❌ Logo yüklenemedi:', {
            error,
            src: img.src,
            logoUrl,
            attempt: attemptCount
          });
          
          if (!isLastAttempt && attemptCount < maxAttempts) {
            // Sonraki denemeyi yap
            setTimeout(() => {
              if (attemptCount === 1 && logoUrl) {
                // İkinci deneme: Doğrudan Supabase Storage URL'i
                const directUrl = logoUrl.includes('storage/v1/object/public') 
                  ? logoUrl 
                  : `${SUPABASE_BASE_URL}/storage/v1/object/public/fotograflar/${logoUrl}`;
                console.log('🔄 Doğrudan Supabase URL deneniyor:', directUrl);
                tryLoad(directUrl);
              } else {
                // Son deneme: Yerel logo
                console.log('🔄 Yerel logo deneniyor');
                tryLoad('/default-logo.svg', true);
              }
            }, 1000);
          } else {
            // Tüm denemeler başarısız
            console.error('❌ Tüm logo yükleme denemeleri başarısız');
            resolve({ success: false, error: new Error('Logo yüklenemedi') });
          }
        };
        
        img.src = url;
      };

      if (logoUrl && logoUrl.trim()) {
        // İlk deneme: Edge Function ile
        const cleanSupabaseUrl = SUPABASE_BASE_URL.endsWith('/') 
          ? SUPABASE_BASE_URL.slice(0, -1) 
          : SUPABASE_BASE_URL;
        
        const functionUrl = `${cleanSupabaseUrl}/functions/v1/image-proxy`;
        const finalUrl = `${functionUrl}?path=${encodeURIComponent(logoUrl)}&v=${Date.now()}`;
        
        console.log('🔗 Logo için Edge Function URL oluşturuldu:', { 
          logoUrl, 
          finalUrl,
          supabaseUrl: SUPABASE_BASE_URL 
        });
        tryLoad(finalUrl);
      } else {
        // Logo URL yok, yerel logo kullan
        console.log('ℹ️ Logo URL belirtilmemiş, yerel logo kullanılıyor');
        tryLoad('/default-logo.svg', true);
      }
    } catch (error) {
      console.error('❌ Logo yükleme hatası:', error);
      resolve({ 
        success: false, 
        error: error instanceof Error ? error : new Error('Bilinmeyen logo yükleme hatası')
      });
    }
  });
};

// Geriye uyumluluk için alias
export const loadLogoSafe = loadLogo;

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
  // Varsayılan ayarları birleştir
  const opts = { ...DEFAULT_OPTIONS, ...options };
  
  // Canvas boyutları
  const canvasWidth = canvas.width;
  const canvasHeight = canvas.height;
  
  // Logo boyutunu hesapla
  const logoSize = Math.min(canvasWidth, canvasHeight) * (opts.size || 0.15);
  const aspectRatio = logoImage.width / logoImage.height;
  const logoWidth = logoSize;
  const logoHeight = logoSize / aspectRatio;
  
  // Opaklığı ayarla
  ctx.globalAlpha = opts.opacity || 0.25;
  
  if (opts.position === 'pattern') {
    // Pattern modunda birden fazla logo çiz
    const rows = opts.patternRows || 4;
    const cols = opts.patternCols || 3;
    
    const spacingX = canvasWidth / (cols + 1);
    const spacingY = canvasHeight / (rows + 1);
    
    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= cols; col++) {
        const x = col * spacingX - logoWidth / 2;
        const y = row * spacingY - logoHeight / 2;
        
        ctx.save();
        ctx.translate(x + logoWidth / 2, y + logoHeight / 2);
        ctx.rotate((opts.angle || -30) * Math.PI / 180);
        ctx.drawImage(logoImage, -logoWidth / 2, -logoHeight / 2, logoWidth, logoHeight);
        ctx.restore();
      }
    }
  } else {
    // Tek logo pozisyonu
    let x: number, y: number;
    
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
          reject(new Error('Canvas context alınamadı'));
          return;
        }
        
        // Boyutları hesapla
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
        
        // Filigran ekle (eğer logo varsa)
        if (logoImage) {
          console.log('🎨 Filigran ekleniyor:', {
            logoWidth: logoImage.width,
            logoHeight: logoImage.height,
            canvasWidth: width,
            canvasHeight: height,
            options: watermarkOptions
          });
          applyWatermark(canvas, ctx, logoImage, watermarkOptions);
        } else {
          console.log('ℹ️ Logo bulunamadı, filigransız işleniyor');
        }
        
        // Blob'a dönüştür
        canvas.toBlob((blob) => {
          if (blob) {
            console.log('✅ Görüntü işleme tamamlandı:', {
              originalSize: file.size,
              processedSize: blob.size,
              hasWatermark: !!logoImage
            });
            resolve(blob);
          } else {
            reject(new Error('Blob oluşturulamadı'));
          }
        }, 'image/jpeg', 0.9);
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
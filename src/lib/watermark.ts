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
  size: 0.15,      // Görüntünün %15'i kadar (kullanıcı talebi)
  opacity: 0.25,   // %25 opaklık (kullanıcı talebi)
  angle: -30,      // -30 derece açı
  position: 'pattern', // Fotoğraf genelinde dağılım
  patternRows: 4,  // 4 satır
  patternCols: 3   // 3 sütun
};

/**
 * Logo URL'sinden veya yerel dosyadan bir görüntü yükler
 * @param logoUrl Logo URL'si (opsiyonel, belirtilmezse yerel logo kullanılır)
 * @returns Logo yükleme sonucu
 */
export const loadLogo = async (logoUrl?: string): Promise<LogoLoadResult> => {
  return new Promise((resolve) => {
    try {
      const img = new Image();
      img.crossOrigin = 'anonymous';

      img.onload = () => {
        console.log('✅ Logo başarıyla yüklendi:', {
          width: img.width,
          height: img.height,
          src: img.src
        });
        resolve({ success: true, image: img });
      };

      img.onerror = (error) => {
        console.error('❌ Logo yüklenemedi:', {
          error,
          src: img.src,
          logoUrl
        });
        
        // İkinci fallback: Doğrudan Supabase Storage URL'i dene
        if (logoUrl && !img.src.includes('storage/v1/object/public')) {
          console.log('🔄 Doğrudan Supabase Storage URL deneniyor...');
          const directUrl = logoUrl.includes('storage/v1/object/public') 
            ? logoUrl 
            : `${SUPABASE_BASE_URL}/storage/v1/object/public/fotograflar/${logoUrl}`;
          img.src = directUrl;
          return;
        }
        
        // Son fallback: Yerel logo dosyası
        console.log('🔄 Yerel logo dosyası yükleniyor...');
        img.src = '/default-logo.svg';
      };

      if (logoUrl) {
        // Önce Edge Function ile dene
        const cleanSupabaseUrl = SUPABASE_BASE_URL.endsWith('/') 
          ? SUPABASE_BASE_URL.slice(0, -1) 
          : SUPABASE_BASE_URL;
        
        const functionUrl = `${cleanSupabaseUrl}/functions/v1/image-proxy`;
        const finalUrl = `${functionUrl}?path=${encodeURIComponent(logoUrl)}&v=${Date.now()}`;
        
        console.log('🔗 Logo için Edge Function URL oluşturuldu:', { finalUrl });
        img.src = finalUrl;
      } else {
        // Yerel logo dosyasını kullan
        console.log('ℹ️ Logo URL belirtilmemiş, yerel logo kullanılıyor');
        img.src = '/default-logo.svg';
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

/**
 * Production-safe logo yükleme fonksiyonu
 */
export const loadLogoSafe = async (logoUrl?: string): Promise<LogoLoadResult> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    
    let attemptCount = 0;
    const maxAttempts = 3;
    
    const tryLoad = (url: string) => {
      attemptCount++;
      console.log(`🔄 Logo yükleme denemesi ${attemptCount}/${maxAttempts}:`, url);
      
      img.onload = () => {
        console.log('✅ Logo başarıyla yüklendi');
        resolve({ success: true, image: img });
      };
      
      img.onerror = () => {
        if (attemptCount < maxAttempts) {
          // Sonraki denemeyi yap
          setTimeout(() => {
            if (attemptCount === 1 && logoUrl) {
              // Doğrudan Supabase URL dene
              const directUrl = `${SUPABASE_BASE_URL}/storage/v1/object/public/fotograflar/${logoUrl}`;
              tryLoad(directUrl);
            } else {
              // Yerel logo kullan
              tryLoad('/default-logo.svg');
            }
          }, 1000);
        } else {
          console.error('❌ Tüm logo yükleme denemeleri başarısız');
          resolve({ success: false, error: new Error('Logo yüklenemedi') });
        }
      };
      
      img.src = url;
    };
    
    if (logoUrl) {
      // Edge Function ile başla
      const functionUrl = `${SUPABASE_BASE_URL}/functions/v1/image-proxy`;
      const finalUrl = `${functionUrl}?path=${encodeURIComponent(logoUrl)}&v=${Date.now()}`;
      tryLoad(finalUrl);
    } else {
      tryLoad('/default-logo.svg');
    }
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
  // Varsayılan ayarları birleştir
  const settings = { ...DEFAULT_OPTIONS, ...options };
  
  try {
    // Logo boyutunu hesapla
    const logoWidth = canvas.width * settings.size!;
    const logoHeight = (logoImage.height / logoImage.width) * logoWidth;
    
    console.log('📐 Logo boyutları:', {
      originalWidth: logoImage.width,
      originalHeight: logoImage.height,
      newWidth: logoWidth,
      newHeight: logoHeight,
      canvasSize: { width: canvas.width, height: canvas.height }
    });
    
    // Canvas'ı kaydet
    ctx.save();
    
    // Logo şeffaflığı ayarla
    ctx.globalAlpha = settings.opacity!;
    
    if (settings.position === 'pattern') {
      // Shutterstock tarzı pattern oluştur
      const rows = settings.patternRows || 4;
      const cols = settings.patternCols || 3;
      
      const spacingX = canvas.width / (cols + 1);
      const spacingY = canvas.height / (rows + 1);
      
      for (let row = 1; row <= rows; row++) {
        for (let col = 1; col <= cols; col++) {
          ctx.save();
          
          const x = col * spacingX;
          const y = row * spacingY;
          
          // Her logo için merkez noktasına git
          ctx.translate(x, y);
          // Açı ver
          ctx.rotate((settings.angle! * Math.PI) / 180);
          
          // Logoyu merkeze çiz
          ctx.drawImage(
            logoImage, 
            -logoWidth / 2, 
            -logoHeight / 2, 
            logoWidth, 
            logoHeight
          );
          
          ctx.restore();
        }
      }
    } else {
      // Tek logo yerleştirme (eski sistem)
      let x = 0;
      let y = 0;
      
      switch (settings.position) {
        case 'top-left':
          x = 0;
          y = 0;
          break;
        case 'top-right':
          x = canvas.width - logoWidth;
          y = 0;
          break;
        case 'bottom-left':
          x = 0;
          y = canvas.height - logoHeight;
          break;
        case 'bottom-right':
          x = canvas.width - logoWidth;
          y = canvas.height - logoHeight;
          break;
        case 'center':
        default:
          // Ortaya yerleştir
          ctx.translate(canvas.width / 2, canvas.height / 2);
          // Açı ver
          ctx.rotate((settings.angle! * Math.PI) / 180);
          x = -logoWidth / 2;
          y = -logoHeight / 2;
          break;
      }
      
      // Logoyu çiz
      ctx.drawImage(logoImage, x, y, logoWidth, logoHeight);
    }
    
    console.log('✅ Filigran başarıyla eklendi');
    
    // Canvas'ı geri yükle
    ctx.restore();
  } catch (error) {
    console.error('❌ Filigran ekleme hatası:', error);
    ctx.restore(); // Hata durumunda da restore et
  }
};

/**
 * Bir görüntüyü yeniden boyutlandırır ve isteğe bağlı olarak filigran ekler
 * @param file Görüntü dosyası
 * @param logoImage Filigran olarak eklenecek logo (isteğe bağlı)
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
    try {
      console.log('🖼️ Resim işleme başladı:', { fileName: file.name });
      
      // Canvas oluştur
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      
      if (!ctx) {
        throw new Error('Canvas context oluşturulamadı');
      }
      
      const img = new Image();
      
      img.onload = () => {
        try {
          console.log('📸 Orijinal resim yüklendi:', {
            originalWidth: img.width,
            originalHeight: img.height
          });
          
          // Yeni boyutları hesapla
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width *= ratio;
            height *= ratio;
            console.log('📏 Resim boyutlandırıldı:', {
              newWidth: width,
              newHeight: height,
              ratio
            });
          } else {
            console.log('📏 Resim boyutlandırma gerekmiyor');
          }
          
          // Canvas boyutunu ayarla
          canvas.width = width;
          canvas.height = height;
          
          // Resmi çiz
          ctx.drawImage(img, 0, 0, width, height);
          console.log('✅ Resim canvas\'a çizildi');
          
          // Logo filigran ekle (eğer logo varsa)
          if (logoImage) {
            console.log('🏷️ Filigran ekleme başlıyor...');
            applyWatermark(canvas, ctx, logoImage, watermarkOptions);
          } else {
            console.log('ℹ️ Logo olmadığı için filigran eklenmedi');
          }
          
          // Canvas'ı blob'a dönüştür
          canvas.toBlob((blob) => {
            if (blob) {
              console.log('✅ Canvas blob\'a dönüştürüldü:', {
                blobSize: blob.size,
                blobType: blob.type
              });
              resolve(blob);
            } else {
              console.error('❌ Canvas to blob conversion failed');
              reject(new Error('Canvas to blob conversion failed'));
            }
          }, 'image/jpeg', 0.85);
        } catch (error) {
          console.error('❌ Image processing error:', error);
          reject(error);
        }
      };
      
      img.onerror = (error) => {
        console.error('❌ Image load failed:', error);
        reject(new Error('Image load failed'));
      };
      
      // Dosyayı URL'ye dönüştür ve yükle
      const objectUrl = URL.createObjectURL(file);
      console.log('🔗 Object URL oluşturuldu:', objectUrl);
      img.src = objectUrl;
    } catch (error) {
      console.error('❌ Resim işleme hatası:', error);
      reject(error);
    }
  });
};
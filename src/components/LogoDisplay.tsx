import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSetting } from "@/hooks/useSettings";
import { Image, Upload } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export const LogoDisplay: React.FC = () => {
  const companyLogo = useSetting("firma_logo_url");
  const companyName = useSetting("firma_adi");

  console.log('🔍 LogoDisplay - companyLogo:', companyLogo);
  console.log('🔍 LogoDisplay - companyName:', companyName);
  console.log('🔍 LogoDisplay - companyLogo type:', typeof companyLogo);
  console.log('🔍 LogoDisplay - companyLogo length:', companyLogo?.length);
  console.log('🔍 LogoDisplay - companyLogo trimmed:', companyLogo?.trim());

  // Supabase storage URL'sini dinamik olarak al
  const getStorageUrl = () => {
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://kepfuptrmccexgyzhcti.supabase.co";
    return `${supabaseUrl}/storage/v1/object/public/fotograflar/`;
  };

  // Logo değiştiğinde favicon ve PWA ikonlarını güncelle - güvenli yaklaşım
  useEffect(() => {
    if (companyLogo && companyLogo.trim()) {
      // DOM hazır olana kadar bekle ve güvenli şekilde güncelle
      const timeoutId = setTimeout(() => {
        try {
          // Document ready kontrolü
          if (document.readyState === 'complete') {
            updateFaviconAndIcons(companyLogo);
          } else {
            // DOM henüz hazır değilse, load eventini bekle
            window.addEventListener('load', () => {
              updateFaviconAndIcons(companyLogo);
            }, { once: true });
          }
        } catch (error) {
          console.warn('Favicon güncelleme hatası:', error);
        }
      }, 200); // Daha uzun gecikme ile DOM'un kesinlikle hazır olmasını sağla

      return () => clearTimeout(timeoutId);
    }
  }, [companyLogo]);

  const updateFaviconAndIcons = (logoUrl: string) => {
    try {
      const fullLogoUrl = logoUrl.startsWith('http') 
        ? logoUrl 
        : `${getStorageUrl()}${logoUrl}`;
      
      // Tüm favicon link'lerini güncelle
      const faviconLinks = document.querySelectorAll('link[rel="icon"]');
      faviconLinks.forEach((link) => {
        const linkElement = link as HTMLLinkElement;
        // Cache'i temizlemek için doğrudan timestamp ekle
        linkElement.href = `${fullLogoUrl}?v=${Date.now()}`;
      });

      // Apple touch icon güncelle
      const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      if (appleTouchIcon) {
        appleTouchIcon.href = `${fullLogoUrl}?v=${Date.now()}`;
      }

      // Apple touch startup image güncelle
      const appleTouchStartupImage = document.querySelector('link[rel="apple-touch-startup-image"]') as HTMLLinkElement;
      if (appleTouchStartupImage) {
        appleTouchStartupImage.href = `${fullLogoUrl}?v=${Date.now()}`;
      }

      // PWA manifest ikonlarını dinamik olarak güncelle
      updatePWAManifest(fullLogoUrl);

      // Browser cache'i temizlemek için force reload
      setTimeout(() => {
        // Sadece favicon'u yeniden yükle
        const links = document.querySelectorAll('link[rel="icon"]');
        links.forEach((link) => {
          const linkElement = link as HTMLLinkElement;
          const originalHref = linkElement.href;
          linkElement.href = '';
          setTimeout(() => {
            linkElement.href = originalHref;
          }, 100);
        });
      }, 500);

      console.log('✅ Favicon ve PWA ikonları güncellendi:', fullLogoUrl);
    } catch (error) {
      console.error('Favicon güncelleme hatası:', error);
    }
  };

  const updatePWAManifest = (logoUrl: string) => {
    try {
      // Güvenli DOM erişimi için kontrol
      if (typeof document === 'undefined') return;
      
      // Mevcut manifest link elementini bul
      const manifestLink = document.querySelector('link[rel="manifest"]') as HTMLLinkElement;
      if (!manifestLink) {
        console.warn('Manifest link element bulunamadı');
        return;
      }

      // DOM operasyonlarını requestAnimationFrame ile ertele
      requestAnimationFrame(() => {
        try {
          // Yeni manifest objesi oluştur
          const newManifest = {
            "name": "Cam Kumlama - Profesyonel Hizmetler",
            "short_name": "CamKumlama", 
            "description": "Profesyonel cam kumlama, tabela ve dijital baskı hizmetleri",
            "theme_color": "#FF6B35",
            "background_color": "#1a1a1a",
            "display": "standalone",
            "orientation": "portrait",
            "scope": window.location.origin + "/",
            "start_url": window.location.origin + "/",
            "icons": [
              {
                "src": logoUrl,
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "maskable"
              },
              {
                "src": logoUrl,
                "sizes": "512x512", 
                "type": "image/png",
                "purpose": "maskable"
              },
              {
                "src": logoUrl,
                "sizes": "192x192",
                "type": "image/png",
                "purpose": "any"
              },
              {
                "src": logoUrl,
                "sizes": "512x512",
                "type": "image/png", 
                "purpose": "any"
              }
            ],
            "categories": ["business", "utilities"],
            "lang": "tr"
          };

          // Blob URL oluştur ve manifest'i güncelle
          const manifestBlob = new Blob([JSON.stringify(newManifest)], { type: 'application/json' });
          const manifestUrl = URL.createObjectURL(manifestBlob);
          
          // Eski manifest URL'sini güvenli şekilde temizle
          const oldHref = manifestLink.href;
          if (oldHref && oldHref.startsWith('blob:')) {
            setTimeout(() => URL.revokeObjectURL(oldHref), 1000);
          }
          
          manifestLink.href = manifestUrl;
          
          console.log('✅ PWA Manifest güncellendi');
        } catch (innerError) {
          console.error('PWA Manifest iç güncelleme hatası:', innerError);
        }
      });
    } catch (error) {
      console.error('PWA Manifest güncelleme hatası:', error);
    }
  };

  // Debug için logo durumunu kontrol et
  const hasLogo = companyLogo && companyLogo.trim().length > 0;
  console.log('🔍 LogoDisplay - hasLogo:', hasLogo);
  console.log('🔍 LogoDisplay - companyLogo value:', `"${companyLogo}"`);

  // Logo URL'sini oluştur
  const getLogoUrl = (logoPath: string) => {
    if (logoPath.startsWith('http')) {
      return logoPath;
    }
    // Eğer sadece dosya adı ise, tam URL oluştur
    if (logoPath && !logoPath.includes('/')) {
      return `${getStorageUrl()}${logoPath}`;
    }
    return logoPath;
  };

  // Önbellek sorunlarını önlemek için timestamp ekle
  const logoUrl = hasLogo ? `${getLogoUrl(companyLogo)}?v=${Date.now()}` : '';
  console.log('🔗 LogoDisplay - Final URL:', logoUrl);

  if (!hasLogo) {
    return (
      <Card className="border-dashed border-muted-foreground/30">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-muted-foreground">
            <Upload className="h-5 w-5" />
            Logo Yüklenmedi
          </CardTitle>
          <CardDescription>
            Şirket logosu ayarlardan yüklenebilir. Logo aynı zamanda favicon ve PWA ikonları olarak kullanılacaktır.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center border-2 border-dashed border-muted-foreground/30">
              <Upload className="h-8 w-8 text-muted-foreground/50" />
            </div>
            <div>
              <p className="font-medium text-muted-foreground">Logo Yüklenmedi</p>
              <p className="text-sm text-muted-foreground/70">
                Logo yüklendiğinde favicon ve PWA ikonları otomatik olarak güncellenecektir
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Image className="h-5 w-5" />
          Şirket Logosu
        </CardTitle>
        <CardDescription>
          Aktif logo - Favicon ve PWA ikonları olarak kullanılıyor
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-muted rounded-lg overflow-hidden border">
            <img
              src={logoUrl}
              alt={companyName || "Şirket Logosu"}
              className="w-full h-full object-contain"
              crossOrigin="anonymous"
              onLoad={() => {
                console.log('✅ Logo başarıyla yüklendi:', logoUrl);
              }}
              onError={(e) => {
                const errorDetails = {
                  logoUrl,
                  companyLogo,
                  storageUrl: getStorageUrl(),
                  timestamp: new Date().toISOString()
                };
                
                console.error('❌ Logo yükleme hatası:', errorDetails);
                console.error(`Logo yükleme hatası: ${companyLogo}`);
                
                // Hata durumunda placeholder göster
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
                
                // Eğer placeholder zaten varsa, tekrar ekleme
                if (!target.parentElement?.querySelector('.logo-error-placeholder')) {
                  const placeholder = document.createElement('div');
                  placeholder.className = 'logo-error-placeholder w-full h-full bg-red-100 flex items-center justify-center text-red-500 text-xs font-medium';
                  placeholder.textContent = 'Logo Hatası';
                  placeholder.title = `Dosya: ${companyLogo}`;
                  target.parentElement?.appendChild(placeholder);
                }
              }}
            />
          </div>
          <div>
            <p className="font-medium">{companyName || "Şirket Adı"}</p>
            <p className="text-sm text-muted-foreground">
              Logo başarıyla yüklendi ve aktif
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
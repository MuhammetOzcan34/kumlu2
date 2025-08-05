import React, { useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useSetting } from "@/hooks/useSettings";
import { Image, Upload } from "lucide-react";

export const LogoDisplay: React.FC = () => {
  const companyLogo = useSetting("firma_logo_url");
  const companyName = useSetting("firma_adi");

  console.log('🔍 LogoDisplay - companyLogo:', companyLogo);
  console.log('🔍 LogoDisplay - companyName:', companyName);

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
        : `https://aqewamsbifugrevmoiqj.supabase.co/storage/v1/object/public/fotograflar/${logoUrl}`;
      
      // Favicon güncelle
      const favicon = document.querySelector('link[rel="icon"]') as HTMLLinkElement;
      if (favicon) {
        favicon.href = fullLogoUrl;
      }

      // Apple touch icon güncelle
      const appleTouchIcon = document.querySelector('link[rel="apple-touch-icon"]') as HTMLLinkElement;
      if (appleTouchIcon) {
        appleTouchIcon.href = fullLogoUrl;
      }

      // PWA manifest ikonlarını dinamik olarak güncelle
      updatePWAManifest(fullLogoUrl);

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

  if (!companyLogo || !companyLogo.trim()) {
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
              src={companyLogo.startsWith('http') 
                ? companyLogo 
                : `https://aqewamsbifugrevmoiqj.supabase.co/storage/v1/object/public/fotograflar/${companyLogo}`
              }
              alt={companyName || "Şirket Logosu"}
              className="w-full h-full object-contain"
              onError={(e) => {
                console.error('Logo görüntüleme hatası:', companyLogo);
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
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
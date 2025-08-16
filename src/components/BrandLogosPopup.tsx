import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useSettings } from "@/hooks/useSettings";

interface BrandLogosPopupProps {
  isOpen: boolean;
  onClose: () => void;
  className?: string;
}

export function BrandLogosPopup({ isOpen, onClose, className }: BrandLogosPopupProps) {
  const { data: settings } = useSettings();
  const [isVisible, setIsVisible] = useState(false);
  const [isAnimating, setIsAnimating] = useState(false);
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // Pop-up ayarları
  const popupTitle = settings?.brand_popup_title || "Kullandığımız Markalar";
  const popupDescription = settings?.brand_popup_description || "Kaliteli hizmet için tercih ettiğimiz markalar";
  const popupDuration = parseInt(settings?.brand_popup_duration || "3000"); // 3 saniye varsayılan
  const popupEnabled = settings?.brand_popup_enabled === "true" || settings?.brand_popup_enabled === true;

  // Logo ayarları - Sadece yüklenen logoları göster
  const logos = [
    ...(settings?.brand_logo_1_image ? [{
      id: 1,
      name: settings.brand_logo_1_name || "Marka 1",
      image: settings.brand_logo_1_image,
      description: settings.brand_logo_1_description || "Kaliteli ürünler"
    }] : []),
    ...(settings?.brand_logo_2_image ? [{
      id: 2,
      name: settings.brand_logo_2_name || "Marka 2",
      image: settings.brand_logo_2_image,
      description: settings.brand_logo_2_description || "Güvenilir marka"
    }] : []),
    ...(settings?.brand_logo_3_image ? [{
      id: 3,
      name: settings.brand_logo_3_name || "Marka 3",
      image: settings.brand_logo_3_image,
      description: settings.brand_logo_3_description || "Profesyonel çözümler"
    }] : []),
    ...(settings?.brand_logo_4_image ? [{
      id: 4,
      name: settings.brand_logo_4_name || "Marka 4",
      image: settings.brand_logo_4_image,
      description: settings.brand_logo_4_description || "İnovatif teknoloji"
    }] : []),
    ...(settings?.brand_logo_5_image ? [{
      id: 5,
      name: settings.brand_logo_5_name || "Marka 5",
      image: settings.brand_logo_5_image,
      description: settings.brand_logo_5_description || "Güçlü performans"
    }] : []),
    ...(settings?.brand_logo_6_image ? [{
      id: 6,
      name: settings.brand_logo_6_name || "Marka 6",
      image: settings.brand_logo_6_image,
      description: settings.brand_logo_6_description || "Yenilikçi tasarım"
    }] : [])
  ];

  // Görsel yükleme callback'i
  const handleImageLoad = useCallback((logoId: number) => {
    setLoadedImages(prev => new Set([...prev, logoId]));
  }, []);

  // Debug log'ları - Pop-up'ın neden açılmadığını anlamak için
  console.log('🔍 BrandLogosPopup Debug:', {
    isOpen,
    popupEnabled,
    logosLength: logos.length,
    settings: {
      brand_popup_enabled: settings?.brand_popup_enabled,
      brand_popup_title: settings?.brand_popup_title,
      brand_logo_1_image: settings?.brand_logo_1_image,
      brand_logo_2_image: settings?.brand_logo_2_image,
      brand_logo_3_image: settings?.brand_logo_3_image
    },
    logos: logos.map(logo => ({ id: logo.id, name: logo.name, hasImage: !!logo.image }))
  });

  // Pop-up etkin değilse veya logo yoksa gösterme
  if (!popupEnabled || logos.length === 0) {
    console.log('🚫 BrandLogosPopup: Pop-up gösterilmiyor', {
      popupEnabled,
      logosLength: logos.length,
      isOpen
    });
    return null;
  }
  
  console.log('✅ Pop-up açılıyor:', { popupEnabled, logosLength: logos.length });

  useEffect(() => {
    if (isOpen) {
      setIsVisible(true);
      setIsAnimating(true);

      // Otomatik kapanma
      const timer = setTimeout(() => {
        setIsAnimating(false);
        setTimeout(() => {
          setIsVisible(false);
          onClose();
        }, 300); // Animasyon süresi
      }, popupDuration);

      return () => clearTimeout(timer);
    }
  }, [isOpen, popupDuration, onClose]);

  if (!isVisible) {
    return null;
  }

  return (
    <div className={cn(
      "fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4",
      "bg-black/50 backdrop-blur-sm transition-opacity duration-300",
      isAnimating ? "opacity-100" : "opacity-0",
      className
    )}>
      <Card className={cn(
        "w-full max-w-xs sm:max-w-md md:max-w-2xl max-h-[90vh] sm:max-h-[80vh] overflow-hidden",
        "transform transition-all duration-300",
        isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
      )}>
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pb-3 sm:pb-4">
          <div className="flex items-center justify-between">
            <div className="flex-1 pr-2">
              <CardTitle className="text-base sm:text-xl font-bold leading-tight">{popupTitle}</CardTitle>
              <p className="text-xs sm:text-sm opacity-90 mt-1 leading-tight">{popupDescription}</p>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setIsAnimating(false);
                setTimeout(() => {
                  setIsVisible(false);
                  onClose();
                }, 300);
              }}
              className="text-white hover:bg-white/20 h-8 w-8 p-0"
            >
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        
        <CardContent className="p-3 sm:p-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 sm:gap-4">
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="flex flex-col items-center p-2 sm:p-4 rounded-lg border border-border hover:border-primary/50 transition-colors group bg-background/50"
              >
                <div className="w-8 h-8 sm:w-12 sm:h-12 mb-1 sm:mb-2 flex items-center justify-center bg-white rounded-lg p-1 sm:p-1.5 shadow-sm relative">
                  {!loadedImages.has(logo.id) && (
                    <div className="w-full h-full bg-gray-200 animate-pulse rounded absolute inset-0" />
                  )}
                  <img
                    src={logo.image}
                    alt={logo.name}
                    className={cn(
                      "max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-200 relative z-10",
                      loadedImages.has(logo.id) ? "opacity-100" : "opacity-0"
                    )}
                    style={{ maxWidth: '24px', maxHeight: '24px' }}
                    loading="eager"
                    decoding="async"
                    onLoad={() => handleImageLoad(logo.id)}
                    onError={(e) => {
                      // Hata durumunda logoyu gizle
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                <h3 className="font-medium text-xs sm:text-xs text-center mb-0.5 sm:mb-1 line-clamp-1">{logo.name}</h3>
                <p className="text-xs sm:text-xs text-muted-foreground text-center leading-tight line-clamp-1 sm:line-clamp-2">
                  {logo.description}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-3 sm:mt-6 text-center">
            <p className="text-xs sm:text-sm text-muted-foreground">
              Bu pop-up {popupDuration / 1000} saniye sonra otomatik olarak kapanacak
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
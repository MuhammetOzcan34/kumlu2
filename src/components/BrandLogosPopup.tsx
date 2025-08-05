import { useState, useEffect } from "react";
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

  // Pop-up ayarları
  const popupTitle = settings?.brand_popup_title || "Kullandığımız Markalar";
  const popupDescription = settings?.brand_popup_description || "Kaliteli hizmet için tercih ettiğimiz markalar";
  const popupDuration = parseInt(settings?.brand_popup_duration || "3000"); // 3 saniye varsayılan
  const popupEnabled = settings?.brand_popup_enabled !== "false";

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

  // Eğer pop-up devre dışı bırakılmışsa veya hiç logo yüklenmemişse hiçbir şey gösterme
  if (!popupEnabled || logos.length === 0) {
    return null;
  }

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
      "fixed inset-0 z-50 flex items-center justify-center p-4",
      "bg-black/50 backdrop-blur-sm transition-opacity duration-300",
      isAnimating ? "opacity-100" : "opacity-0",
      className
    )}>
      <Card className={cn(
        "w-full max-w-2xl max-h-[80vh] overflow-hidden",
        "transform transition-all duration-300",
        isAnimating ? "scale-100 opacity-100" : "scale-95 opacity-0"
      )}>
        <CardHeader className="bg-gradient-to-r from-blue-600 to-purple-600 text-white pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">{popupTitle}</CardTitle>
              <p className="text-sm opacity-90 mt-1">{popupDescription}</p>
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
        
        <CardContent className="p-6">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {logos.map((logo) => (
              <div
                key={logo.id}
                className="flex flex-col items-center p-4 rounded-lg border border-border hover:border-primary/50 transition-colors group bg-background/50"
              >
                <div className="w-16 h-16 mb-3 flex items-center justify-center bg-white rounded-lg p-2 shadow-sm">
                  <img
                    src={logo.image}
                    alt={logo.name}
                    className="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-200"
                    onError={(e) => {
                      // Hata durumunda logoyu gizle
                      const target = e.target as HTMLImageElement;
                      target.style.display = 'none';
                    }}
                  />
                </div>
                <h3 className="font-medium text-sm text-center mb-1">{logo.name}</h3>
                <p className="text-xs text-muted-foreground text-center leading-relaxed">
                  {logo.description}
                </p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Bu pop-up {popupDuration / 1000} saniye sonra otomatik olarak kapanacak
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
} 
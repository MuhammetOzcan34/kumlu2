import { useState, useCallback } from "react";
import { useReferenceLogos, getReferenceLogoUrl } from "@/hooks/useReferenceLogos";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

export const ReferenceLogos = () => {
  const { data: logos, isLoading } = useReferenceLogos();
  const [loadedImages, setLoadedImages] = useState<Set<number>>(new Set());

  // Görsel yükleme callback'i
  const handleImageLoad = useCallback((logoId: number) => {
    setLoadedImages(prev => new Set([...prev, logoId]));
  }, []);

  if (isLoading) {
    return (
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <Skeleton key={i} className="aspect-square rounded-lg" />
        ))}
      </div>
    );
  }

  if (!logos || logos.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Henüz referans logosu eklenmemiş.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-3">
      {logos.map((logo) => (
        <Card key={logo.id} className="overflow-hidden hover:shadow-md transition-shadow group">
          <div className="aspect-square p-2 bg-white flex items-center justify-center relative">
            {!loadedImages.has(logo.id) && (
              <div className="absolute inset-0 bg-gray-200 animate-pulse rounded" />
            )}
            <img 
              src={getReferenceLogoUrl(logo.dosya_yolu)}
              alt={logo.kategori_adi || logo.baslik || "Referans Logo"}
              className={cn(
                "max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200",
                loadedImages.has(logo.id) ? "opacity-100" : "opacity-0"
              )}
              style={{ maxWidth: '80px', maxHeight: '80px' }}
              loading="lazy"
              onLoad={() => handleImageLoad(logo.id)}
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          {logo.kategori_adi && (
            <div className="p-1.5 text-center border-t">
              <p className="text-xs text-muted-foreground font-medium truncate leading-tight">
                {logo.kategori_adi}
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
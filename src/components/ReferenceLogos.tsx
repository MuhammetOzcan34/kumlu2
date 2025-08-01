import { useReferenceLogos, getReferenceLogoUrl } from "@/hooks/useReferenceLogos";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ReferenceLogos = () => {
  const { data: logos, isLoading } = useReferenceLogos();

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
    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-4">
      {logos.map((logo) => (
        <Card key={logo.id} className="overflow-hidden hover:shadow-md transition-shadow group">
          <div className="aspect-square p-3 bg-white flex items-center justify-center">
            <img 
              src={getReferenceLogoUrl(logo.dosya_yolu)}
              alt={logo.kategori_adi || logo.baslik || "Referans Logo"}
              className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-200"
              onError={(e) => {
                const target = e.target as HTMLImageElement;
                target.style.display = 'none';
              }}
            />
          </div>
          {logo.kategori_adi && (
            <div className="p-2 text-center border-t">
              <p className="text-xs text-muted-foreground font-medium truncate">
                {logo.kategori_adi}
              </p>
            </div>
          )}
        </Card>
      ))}
    </div>
  );
};
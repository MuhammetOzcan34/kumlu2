import { useSetting } from "@/hooks/useSettings";
import { MapPin } from "lucide-react";

interface GoogleMapProps {
  className?: string;
}

export const GoogleMap = ({ className }: GoogleMapProps) => {
  const enlem = useSetting("firma_enlem");
  const boylam = useSetting("firma_boylam");
  const firmaAdres = useSetting("firma_adres");

  // Eğer adres yoksa placeholder göster
  if (!firmaAdres) {
    return (
      <div className={`aspect-video bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <div className="text-center">
          <MapPin className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
          <p className="text-muted-foreground">Adres bilgisi girildiğinde harita gösterilecek</p>
        </div>
      </div>
    );
  }

  // Google Maps iframe URL'i oluştur - ücretsiz embed API kullan
  let mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(firmaAdres)}`;
  
  // Eğer koordinatlar varsa onları kullan
  if (enlem && boylam) {
    mapUrl = `https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${enlem},${boylam}`;
  }

  return (
    <div className={`aspect-video rounded-lg overflow-hidden ${className}`}>
      <iframe
        src={mapUrl}
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`${firmaAdres} Konumu`}
      />
    </div>
  );
};
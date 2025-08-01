import { useSetting } from "@/hooks/useSettings";

interface GoogleMapProps {
  className?: string;
}

export const GoogleMap = ({ className }: GoogleMapProps) => {
  const enlem = useSetting("firma_enlem");
  const boylam = useSetting("firma_boylam");
  const firmaAdres = useSetting("firma_adres");

  // Eğer koordinatlar yoksa placeholder göster
  if (!enlem || !boylam) {
    return (
      <div className={`aspect-video bg-muted rounded-lg flex items-center justify-center ${className}`}>
        <p className="text-muted-foreground">Harita için koordinat bilgisi bekleniyor</p>
      </div>
    );
  }

  // Google Maps iframe URL'i oluştur
  const mapUrl = `https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3008.7!2d${boylam}!3d${enlem}!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zM${Math.floor(parseFloat(enlem))}°${((parseFloat(enlem) % 1) * 60).toFixed(2)}'N%20${Math.floor(parseFloat(boylam))}°${((parseFloat(boylam) % 1) * 60).toFixed(2)}'E!5e0!3m2!1str!2str!4v1609459200000!5m2!1str!2str`;

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
        title={`${firmaAdres || 'Firma'} Konumu`}
      />
    </div>
  );
};
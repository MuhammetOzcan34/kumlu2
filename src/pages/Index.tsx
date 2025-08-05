import { Palette, FileText, Settings, Image, Wrench, Eye, Car } from "lucide-react";
import { useState } from "react";

import { MobileNavigation } from "@/components/MobileNavigation";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { ServiceCard } from "@/components/ServiceCard";
import { Card, CardContent } from "@/components/ui/card";
import { ImageSlider } from "@/components/ImageSlider";
import { HeroButtons } from "@/components/HeroButtons";
import { ImageModal } from "@/components/ImageModal";
import { InstagramFeed } from "@/components/InstagramFeed";
import { TeklifFormu } from "@/components/TeklifFormu";
import { useSetting } from "@/hooks/useSettings";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";



// Servis kartları
const services = [
  {
    title: "Cam Kumlama",
    icon: Palette,
    href: "/kumlamalar",
    gradient: "bg-gradient-to-r from-warm-orange to-coral-pink"
  },
  {
    title: "Araç Giydirme", 
    icon: Car,
    href: "/arac-giydirme",
    gradient: "bg-gradient-to-r from-coral-pink to-warm-orange"
  },
  {
    title: "Tabelalar", 
    icon: FileText,
    href: "/tabelalar",
    gradient: "bg-gradient-to-r from-amber-gold to-sunset-red"
  },
  {
    title: "Dijital Baskı",
    icon: Image,
    href: "/kumlamalar",
    gradient: "bg-gradient-to-r from-coral-pink to-warm-orange"
  },

  {
    title: "Hesaplama",
    icon: Wrench,
    href: "/hesaplama",
    gradient: "bg-gradient-to-r from-warm-orange to-sunset-red"
  },
  {
    title: "Referanslar",
    icon: Eye,
    href: "/referanslar",
    gradient: "bg-gradient-to-r from-coral-pink to-amber-gold"
  },
  {
    title: "Teklif Al",
    icon: FileText,
    href: "/teklif-al",
    gradient: "bg-gradient-to-r from-amber-gold to-warm-orange",
    isQuoteForm: true
  }
];

const Index = () => {
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);

  // Slider için fotoğrafları çek
  const { data: sliderPhotos } = useQuery({
    queryKey: ["slider-photos"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("fotograflar")
        .select("*")
        .eq("aktif", true)
        .or("gorsel_tipi.eq.slider,kullanim_alani.cs.{ana-sayfa-slider}")
        .order("sira_no", { ascending: true });
      
      if (error) {
        console.error('❌ Slider photos fetch error:', error);
        return [];
      }
      
      console.log('🖼️ Slider fotoğrafları yüklendi:', data?.length || 0);
      
      return data?.map(photo => ({
        id: photo.id,
        image: supabase.storage.from('fotograflar').getPublicUrl(photo.dosya_yolu).data.publicUrl,
        title: photo.baslik || "",
        description: photo.aciklama || ""
      })) || [];
    },
  });

  // Eğer slider fotoğrafı yoksa varsayılan verileri kullan
  const slides = sliderPhotos || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <DesktopSidebar />
      
      {/* Mobile Hamburger Menu */}
      <HamburgerMenu />
      
      {/* Main Content */}
      <main className="lg:ml-64 pb-20 lg:pb-8">
        <div className="pt-20 lg:pt-8 px-4 lg:px-8">
          {/* Hero Buttons */}
          <HeroButtons />
          
          {/* Hero Slider */}
          <section className="mb-8">
            <ImageSlider slides={slides} onImageClick={setSelectedImageIndex} />
          </section>
          
          {/* Services Grid */}
          <section className="mb-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-center sm:text-left">
                Hizmetlerimiz
              </h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
              {services.map((service) => {
                if (service.isQuoteForm) {
                  return (
                    <TeklifFormu 
                      key={service.title}
                      triggerButtonText={service.title}
                      triggerButtonVariant="ghost"
                      className="w-full"
                      asServiceCard={true}
                      serviceIcon={service.icon}
                      serviceGradient={service.gradient}
                    />
                  );
                }
                
                return (
                  <ServiceCard
                    key={service.title}
                    title={service.title}
                    icon={service.icon}
                    href={service.href}
                    gradient={service.gradient}
                  />
                );
              })}
            </div>
          </section>
          
          {/* Instagram Section */}
          <section className="mb-8">
            <InstagramFeed />
          </section>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* Image Modal */}
      {selectedImageIndex >= 0 && (
        <ImageModal
          images={slides}
          currentIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(-1)}
          onNext={() => setSelectedImageIndex(Math.min(selectedImageIndex + 1, slides.length - 1))}
          onPrev={() => setSelectedImageIndex(Math.max(selectedImageIndex - 1, 0))}
        />
      )}
    </div>
  );
};

export default Index;

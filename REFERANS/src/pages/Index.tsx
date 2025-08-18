import { Palette, FileText, Settings, Image, Wrench, Eye } from "lucide-react";
import { useState } from "react";
import { PhoneButton } from "@/components/PhoneButton";
import { MobileNavigation } from "@/components/MobileNavigation";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { ServiceCard } from "@/components/ServiceCard";
import { ImageSlider } from "@/components/ImageSlider";
import { HeroButtons } from "@/components/HeroButtons";
import { ImageModal } from "@/components/ImageModal";
import { InstagramFeed } from "@/components/InstagramFeed";
import { useSetting } from "@/hooks/useSettings";

// Örnek slider verileri
const mockSlides = [
  {
    id: "1",
    image: "https://images.unsplash.com/photo-1609838196847-31fbf50cc7bf?w=800&h=400&fit=crop",
    title: "Profesyonel Cam Kumlama",
    description: "En kaliteli cam kumlama hizmetleri için doğru adrestesiniz"
  },
  {
    id: "2", 
    image: "https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=800&h=400&fit=crop",
    title: "Özel Tasarım Tabelalar",
    description: "İşletmenize özel profesyonel tabela çözümleri"
  },
  {
    id: "3",
    image: "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&h=400&fit=crop", 
    title: "Dijital Baskı Hizmetleri",
    description: "Yüksek kalitede dijital baskı ve folyo uygulamaları"
  }
];

// Servis kartları
const services = [
  {
    title: "Cam Kumlama",
    description: "Geleneksel ve modern cam kumlama teknikleri ile profesyonel hizmet",
    icon: Palette,
    href: "/kumlamalar",
    gradient: "bg-gradient-to-r from-warm-orange to-coral-pink"
  },
  {
    title: "Tabelalar", 
    description: "Alüminyum, pleksi ve kutu harf tabela çözümleri",
    icon: FileText,
    href: "/tabelalar",
    gradient: "bg-gradient-to-r from-amber-gold to-sunset-red"
  },
  {
    title: "Dijital Baskı",
    description: "Vinil, folyo, mesh ve afiş baskı hizmetleri",
    icon: Image,
    href: "/kumlamalar",
    gradient: "bg-gradient-to-r from-coral-pink to-warm-orange"
  },
  {
    title: "Servis Bedelleri",
    description: "Hizmetlerimizin güncel fiyat listesi ve montaj bedelleri",
    icon: Settings,
    href: "/servis-bedelleri", 
    gradient: "bg-gradient-to-r from-sunset-red to-amber-gold"
  },
  {
    title: "Hesaplama",
    description: "Proje hesaplama araçları ve maliyet hesaplayıcı",
    icon: Wrench,
    href: "/hesaplama",
    gradient: "bg-gradient-to-r from-warm-orange to-sunset-red"
  },
  {
    title: "Referanslar",
    description: "Tamamlanan projeler ve müşteri memnuniyeti",
    icon: Eye,
    href: "/referanslar",
    gradient: "bg-gradient-to-r from-coral-pink to-amber-gold"
  }
];

const Index = () => {
  const phoneNumber = useSetting("telefon") || "+90 555 123 45 67";
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);

  return (
    <div className="min-h-screen bg-background">
      {/* Desktop Sidebar */}
      <DesktopSidebar />
      
      {/* Mobile Hamburger Menu */}
      <HamburgerMenu />
      
      {/* Phone Button */}
      <PhoneButton phoneNumber={phoneNumber} />
      
      {/* Main Content */}
      <main className="lg:ml-64 pb-20 lg:pb-8">
        <div className="pt-20 lg:pt-8 px-4 lg:px-8">
          {/* Hero Buttons */}
          <HeroButtons />
          
          {/* Hero Slider */}
          <section className="mb-8">
            <ImageSlider slides={mockSlides} />
          </section>
          
          {/* Services Grid */}
          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-6 text-center lg:text-left">
              Hizmetlerimiz
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {services.map((service) => (
                <ServiceCard
                  key={service.title}
                  title={service.title}
                  description={service.description}
                  icon={service.icon}
                  href={service.href}
                  gradient={service.gradient}
                />
              ))}
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
          images={mockSlides}
          currentIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(-1)}
          onNext={() => setSelectedImageIndex(Math.min(selectedImageIndex + 1, mockSlides.length - 1))}
          onPrev={() => setSelectedImageIndex(Math.max(selectedImageIndex - 1, 0))}
        />
      )}
    </div>
  );
};

export default Index;

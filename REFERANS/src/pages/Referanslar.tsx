import { PhoneButton } from "@/components/PhoneButton";
import { MobileNavigation } from "@/components/MobileNavigation";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { useSetting } from "@/hooks/useSettings";

const Referanslar = () => {
  const phoneNumber = useSetting("telefon") || "+90 555 123 45 67";

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
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold mb-4">Referanslar</h1>
            <p className="text-muted-foreground">
              Tamamlanan projelerimiz ve müşteri yorumları
            </p>
          </div>
          
          {/* Reference Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <div className="aspect-video bg-muted">
                  <img 
                    src="/placeholder.svg" 
                    alt={`Referans ${i + 1}`}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-4">
                  <h3 className="font-semibold mb-2">Proje {i + 1}</h3>
                  <p className="text-sm text-muted-foreground mb-2">
                    Örnek proje açıklaması ve müşteri yorumu
                  </p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span>2024</span>
                    <span>•</span>
                    <span>İstanbul</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {/* Load More */}
          <div className="text-center mt-8">
            <button className="btn-mobile">
              Daha Fazla Yükle
            </button>
          </div>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
    </div>
  );
};

export default Referanslar;
import { useState } from "react";
import { PhoneButton } from "@/components/PhoneButton";
import { MobileNavigation } from "@/components/MobileNavigation";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { ImageModal } from "@/components/ImageModal";
import { useCategories } from "@/hooks/useCategories";
import { useSetting } from "@/hooks/useSettings";
import { cn } from "@/lib/utils";

const AracGiydirme = () => {
  const phoneNumber = useSetting("telefon") || "+90 555 123 45 67";
  const { data: categories, isLoading } = useCategories("tabela");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  
  // Mock gallery images - gerçek veritabanından gelecek
  const galleryImages = Array.from({ length: 12 }, (_, i) => ({
    id: `img-${i + 1}`,
    image: "/placeholder.svg",
    title: `Araç Giydirme Çalışması ${i + 1}`,
    description: `Örnek araç giydirme çalışması açıklaması ${i + 1}`
  }));

  // İlk kategoriyi otomatik seç
  if (categories && categories.length > 0 && !activeCategory) {
    setActiveCategory(categories[0].id);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-pulse text-lg">Yükleniyor...</div>
      </div>
    );
  }

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
        <div className="pt-20 lg:pt-8">
          {/* Category Tabs */}
          <div className="category-tabs sticky top-16 lg:top-4 bg-background/95 backdrop-blur-sm z-30 border-b border-border">
            {categories?.map((category) => (
              <button
                key={category.id}
                onClick={() => setActiveCategory(category.id)}
                className={cn(
                  "category-tab",
                  activeCategory === category.id && "active"
                )}
              >
                {category.ad}
              </button>
            ))}
          </div>
          
          {/* Gallery Content */}
          <div className="px-4 lg:px-8 py-6">
            {categories?.find(cat => cat.id === activeCategory) && (
              <div className="space-y-6">
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-2">
                    {categories.find(cat => cat.id === activeCategory)?.ad}
                  </h1>
                  <p className="text-muted-foreground">
                    {categories.find(cat => cat.id === activeCategory)?.aciklama}
                  </p>
                </div>
                
                {/* Instagram-style Gallery */}
                <div className="gallery-grid">
                  {galleryImages.map((image, index) => (
                    <div
                      key={image.id}
                      className="aspect-square bg-muted rounded-lg cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                      onClick={() => setSelectedImageIndex(index)}
                    >
                      <img 
                        src={image.image} 
                        alt={image.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
                
                {/* Load More Button */}
                <div className="text-center">
                  <button className="btn-mobile">
                    Daha Fazla Yükle
                  </button>
                </div>
              </div>
            )}
            
            {!activeCategory && categories?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Henüz kategori eklenmemiş.</p>
              </div>
            )}
          </div>
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* Image Modal */}
      {selectedImageIndex >= 0 && (
        <ImageModal
          images={galleryImages}
          currentIndex={selectedImageIndex}
          onClose={() => setSelectedImageIndex(-1)}
          onNext={() => setSelectedImageIndex((selectedImageIndex + 1) % galleryImages.length)}
          onPrev={() => setSelectedImageIndex((selectedImageIndex - 1 + galleryImages.length) % galleryImages.length)}
        />
      )}
    </div>
  );
};

export default AracGiydirme;
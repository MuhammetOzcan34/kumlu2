import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PhoneButton } from "@/components/PhoneButton";
import { MobileNavigation } from "@/components/MobileNavigation";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { ImageModal } from "@/components/ImageModal";
import { BrandLogosPopup } from "@/components/BrandLogosPopup";
import { useSetting } from "@/hooks/useSettings";
import { useCategories } from "@/hooks/useCategories";
import { usePhotos, getImageUrl } from "@/hooks/usePhotos";
import { cn } from "@/lib/utils";
import { getPlaceholderImage, handleImageError } from "@/utils/placeholders";

const Kumlamalar = () => {
  console.log('Kumlamalar component version: 2.0'); // Sürüm kontrolü
  const phoneNumber = useSetting("telefon") || "+90 555 123 45 67";
  const { data: categories, isLoading } = useCategories("kumlama");
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  const [showBrandPopup, setShowBrandPopup] = useState(false);
  
  // Aktif kategoriye göre fotoğrafları çek (kumlama kullanım alanı ile)
  const { data: photos = [], isLoading: photosLoading } = usePhotos(
    activeCategory && typeof activeCategory === 'string' && activeCategory.trim() !== '' && activeCategory !== 'undefined' ? activeCategory : undefined, 
    'kumlama'
  );
  
  // Debug: Aktif kategori ve fotoğraf sayısını logla
  useEffect(() => {
    console.log('🔍 Kumlamalar - Aktif kategori:', activeCategory);
    console.log('🔍 Kumlamalar - Fotoğraf sayısı:', photos.length);
  }, [activeCategory, photos.length]);
  
  // Kategori değiştiğinde selectedImageIndex'i sıfırla
  useEffect(() => {
    if (activeCategory) {
      console.log('🔄 Kategori değişti, selectedImageIndex sıfırlanıyor');
      setSelectedImageIndex(-1);
    }
  }, [activeCategory]);
  
  // Fotoğrafları ImageModal formatına dönüştür
  const galleryImages = useMemo(() => {
    return photos.map((photo, index) => ({
      id: photo.id,
      image: getImageUrl(photo.dosya_yolu),
      title: photo.baslik || 'Fotoğraf',
      description: photo.aciklama || ''
    }));
  }, [photos]);

  useEffect(() => {
    if (selectedImageIndex > -1) {
      console.log(`🖼️ Kumlamalar state update: selectedImageIndex is now ${selectedImageIndex}`);
    }
  }, [selectedImageIndex]);

  // Fotoğraf tıklama handler'ı
  const handleImageClick = useCallback((index: number) => {
    console.log(`🎯 Kumlamalar CLICK: Clicked index ${index}. Previous index was ${selectedImageIndex}.`);
    setSelectedImageIndex(index);
  }, [selectedImageIndex]);

  // İlk kategoriyi otomatik seç
  useEffect(() => {
    if (categories && categories.length > 0 && !activeCategory) {
      const firstCategory = categories[0];
      if (firstCategory && firstCategory.id) {
        console.log('🎯 İlk kategori seçiliyor:', firstCategory.ad, firstCategory.id);
        setActiveCategory(firstCategory.id);
      }
    }
  }, [categories, activeCategory]);

  // Sayfa yüklendiğinde pop-up'ı göster
  useEffect(() => {
    console.log('🚀 Kumlamalar: Pop-up timer başlatılıyor...');
    const timer = setTimeout(() => {
      console.log('⏰ Kumlamalar: 0.5 saniye geçti, showBrandPopup true yapılıyor');
      setShowBrandPopup(true);
    }, 500); // 0.5 saniye sonra pop-up'ı göster

    return () => clearTimeout(timer);
  }, []);

  // showBrandPopup state değişimini takip et
  useEffect(() => {
    console.log('🔔 Kumlamalar: showBrandPopup değişti:', showBrandPopup);
  }, [showBrandPopup]);

  // Aktif kategoriyi memo ile cache'le
  const currentCategory = useMemo(() => {
    return categories?.find(cat => cat.id === activeCategory);
  }, [categories, activeCategory]);

  if (isLoading || photosLoading) {
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
          <div className="category-tabs sticky top-20 lg:top-8 bg-background/95 backdrop-blur-sm z-40 border-b border-border py-4">
            {categories?.map((category) => (
              <button
                key={`category-${category.id}`}
                onClick={() => {
                  if (category && category.id) {
                    console.log('🎯 Kategori seçildi:', category.ad, category.id);
                    setActiveCategory(category.id);
                  }
                }}
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
            {currentCategory ? (
              <div className="space-y-6" key={`gallery-${currentCategory.id}`}>
                <div className="text-center">
                  <h1 className="text-2xl font-bold mb-2">
                    {currentCategory.ad}
                  </h1>
                  <p className="text-muted-foreground">
                    {currentCategory.aciklama}
                  </p>
                </div>
                
                {/* Instagram-style Gallery */}
                {galleryImages.length > 0 ? (
                  <div className="gallery-grid">
                    {galleryImages.map((image, index) => (
                      <div
                        key={`${currentCategory.id}-img-${image.id}`}
                        className="aspect-square lg:aspect-[4/3] xl:aspect-[3/2] bg-muted rounded-lg cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                        onClick={() => handleImageClick(index)}
                      >
                        <img 
                          src={image.image || getPlaceholderImage('kumlamalar', 'kumlama')} 
                          alt={image.title}
                          className="w-full h-full object-cover"
                          loading="lazy"
                          decoding="async"
                          onError={(e) => {
                            const fallbackUrl = getPlaceholderImage('kumlamalar', 'kumlama');
                            handleImageError(e, fallbackUrl);
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">Bu kategoride henüz fotoğraf eklenmemiş.</p>
                  </div>
                )}
              </div>
            ) : categories?.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Henüz kategori eklenmemiş.</p>
              </div>
            ) : null}
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
          onClose={() => {
            console.log('Modal CLOSE triggered. Setting index to -1');
            setSelectedImageIndex(-1);
          }}
          onNext={() => setSelectedImageIndex((prevIndex) => {
            const nextIndex = (prevIndex + 1) % galleryImages.length;
            console.log(`NEXT button clicked. Index from ${prevIndex} to ${nextIndex}`);
            return nextIndex;
          })}
          onPrev={() => setSelectedImageIndex((prevIndex) => {
            const prevIndexCal = (prevIndex - 1 + galleryImages.length) % galleryImages.length;
            console.log(`PREV button clicked. Index from ${prevIndex} to ${prevIndexCal}`);
            return prevIndexCal;
          })}
        />
      )}

      {/* Brand Logos Popup */}
      <BrandLogosPopup
        isOpen={showBrandPopup}
        onClose={() => setShowBrandPopup(false)}
      />
    </div>
  );
};

// React.memo ile bileşeni optimize et
const MemoizedKumlamalar = React.memo(Kumlamalar);
MemoizedKumlamalar.displayName = 'Kumlamalar';

export default MemoizedKumlamalar;
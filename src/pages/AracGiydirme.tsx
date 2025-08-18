import React, { useState, useEffect, useMemo, useCallback } from "react";
import { PhoneButton } from "@/components/PhoneButton";
import { MobileNavigation } from "@/components/MobileNavigation";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { ImageModal } from "@/components/ImageModal";
import { useSetting } from "@/hooks/useSettings";
import { useCategories } from "@/hooks/useCategories";
import { usePhotos, getImageUrl } from "@/hooks/usePhotos";
import { cn } from "@/lib/utils";
import { getPlaceholderImage, handleImageError } from "@/utils/placeholders";

const AracGiydirme = () => {
  console.log('AracGiydirme component version: 2.0'); // Sürüm kontrolü
  const phoneNumber = useSetting("telefon") || "+90 555 123 45 67";
  const { data: allCategories, isLoading } = useCategories();
  const [activeCategory, setActiveCategory] = useState<string>("");
  const [selectedImageIndex, setSelectedImageIndex] = useState<number>(-1);
  
  // Sadece arac-giydirme tipindeki kategorileri filtrele
  const categories = useMemo(() => {
    if (!allCategories) return [];
    return allCategories.filter(category => category.tip === 'arac-giydirme');
  }, [allCategories]);
  
  // Aktif kategoriye göre fotoğrafları çek (arac-giydirme kullanım alanı ile)
  const { data: photos = [], isLoading: photosLoading } = usePhotos(
    activeCategory && typeof activeCategory === 'string' && activeCategory.trim() !== '' && activeCategory !== 'undefined' ? activeCategory : undefined, 
    'arac-giydirme'
  );
  
  // Debug: Aktif kategori ve fotoğraf sayısını logla
  useEffect(() => {
    console.log('🔍 AracGiydirme - Aktif kategori:', activeCategory, typeof activeCategory);
    console.log('🔍 AracGiydirme - Fotoğraf sayısı:', photos.length);
  }, [activeCategory, photos.length]);
  
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
      console.log(`🖼️ AraçGiydirme state update: selectedImageIndex is now ${selectedImageIndex}`);
    }
  }, [selectedImageIndex]);

  // Fotoğraf tıklama handler'ı
  const handleImageClick = useCallback((index: number) => {
    console.log(`🎯 AraçGiydirme CLICK: Clicked index ${index}. Previous index was ${selectedImageIndex}.`);
    setSelectedImageIndex(index);
  }, [selectedImageIndex]);

  // İlk kategoriyi otomatik seç
  useEffect(() => {
    if (categories && categories.length > 0 && !activeCategory) {
      const firstCategory = categories[0];
      if (firstCategory && firstCategory.id) {
        console.log('🎯 İlk kategori seçiliyor (Araç Giydirme):', firstCategory.ad, firstCategory.id);
        setActiveCategory(firstCategory.id);
      }
    }
  }, [categories, activeCategory]);

  // Kategori değiştiğinde selectedImageIndex'i sıfırla
  useEffect(() => {
    if (activeCategory) {
      setSelectedImageIndex(-1);
    }
  }, [activeCategory]);

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
          <div className="category-tabs sticky top-16 lg:top-4 bg-background/95 backdrop-blur-sm z-30 border-b border-border">
            {categories?.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  if (category && category.id) {
                    console.log('🎯 Kategori seçildi (Araç Giydirme):', category.ad, category.id);
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
                {galleryImages.length > 0 ? (
                <div className="gallery-grid">
                  {galleryImages.map((image, index) => (
                    <div
                      key={image.id}
                                              className="aspect-square lg:aspect-[4/3] xl:aspect-[3/2] bg-muted rounded-lg cursor-pointer hover:scale-105 transition-transform overflow-hidden"
                      onClick={() => handleImageClick(index)}
                    >
                      <img 
                        src={image.image || getPlaceholderImage('arac-giydirme', 'arac-giydirme')} 
                        alt={image.title}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        decoding="async"
                        onError={(e) => {
                          const fallbackUrl = getPlaceholderImage('arac-giydirme', 'arac-giydirme');
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
                
                {/* Load More Button - sadece fotoğraf varsa göster */}
                {galleryImages.length > 0 && (
                <div className="text-center">
                  <button className="btn-mobile">
                    Daha Fazla Yükle
                  </button>
                </div>
                )}
              </div>
            )}
            
            {!activeCategory && categories?.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Araç giydirme kategorisinde henüz kategori eklenmemiş.</p>
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
    </div>
  );
};

// React.memo ile bileşeni optimize et
const MemoizedAracGiydirme = React.memo(AracGiydirme);
MemoizedAracGiydirme.displayName = 'AracGiydirme';

export default MemoizedAracGiydirme;
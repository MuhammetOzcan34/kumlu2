import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { ChevronLeft, ChevronRight, Play, Pause, ImageIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { handleImageLoadError } from '@/utils/storageUtils';

interface SlideItem {
  id: string;
  image: string;
  title: string;
  description: string;
}

interface ImageSliderProps {
  slides: SlideItem[];
  autoPlay?: boolean;
  interval?: number;
  onImageClick?: (index: number) => void;
}

const OptimizedImage = React.memo(({ src, alt, onClick, isActive }: {
  src: string;
  alt: string;
  onClick: () => void;
  isActive: boolean;
}) => {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!loaded && !error && (
        <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
        loading={isActive ? 'eager' : 'lazy'}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          setError(true);
          handleImageLoadError(e, 'slider');
        }}
        onClick={onClick}
      />
    </div>
  );
});

OptimizedImage.displayName = "OptimizedImage";

const ImageSlider = ({ slides, autoPlay = true, interval = 5000, onImageClick }: ImageSliderProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const [isPlaying, setIsPlaying] = useState(autoPlay);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Slides yoksa veya boşsa placeholder göster
  if (!slides || slides.length === 0) {
    return (
      <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gradient-to-r from-warm-orange to-coral-pink rounded-lg flex items-center justify-center">
        <div className="text-center text-white">
          <ImageIcon className="w-12 h-12 mx-auto mb-2" />
          <h3 className="text-lg font-semibold mb-1">Kumlu Folyo</h3>
          <p className="text-sm opacity-90">Profesyonel Cam Kumlama ve Folyo Hizmetleri</p>
        </div>
      </div>
    );
  }

  // Otomatik geçiş fonksiyonu
  const nextSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const prevSlide = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  // Otomatik oynatma
  useEffect(() => {
    if (isPlaying && slides.length > 1) {
      intervalRef.current = setInterval(nextSlide, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, nextSlide, interval, slides.length]);

  // Touch events
  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) {
      nextSlide();
    } else if (isRightSwipe) {
      prevSlide();
    }
  };

  const togglePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  const handleImageClick = () => {
    onImageClick?.(currentSlide);
  };

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-64 sm:h-80 md:h-96 overflow-hidden rounded-lg group"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
    >
      {/* Ana görsel */}
      <div className="relative w-full h-full">
        <OptimizedImage
          src={slides[currentSlide].image}
          alt={slides[currentSlide].title}
          onClick={handleImageClick}
          isActive={true}
        />
        
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent" />
        
        {/* Başlık ve açıklama */}
        <div className="absolute bottom-4 left-4 right-4 text-white">
          <h3 className="text-lg sm:text-xl font-bold mb-1 drop-shadow-lg">
            {slides[currentSlide].title}
          </h3>
          <p className="text-sm sm:text-base opacity-90 drop-shadow-lg line-clamp-2">
            {slides[currentSlide].description}
          </p>
        </div>
      </div>

      {/* Navigasyon butonları */}
      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={prevSlide}
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={nextSlide}
          >
            <ChevronRight className="h-6 w-6" />
          </Button>

          {/* Oynat/Durdur butonu */}
          <Button
            variant="ghost"
            size="icon"
            className="absolute top-4 right-4 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={togglePlayPause}
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
          </Button>
        </>
      )}

      {/* Dot indicators */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              className={cn(
                "w-2 h-2 rounded-full transition-all duration-300",
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              )}
              onClick={() => goToSlide(index)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

ImageSlider.displayName = "ImageSlider";

export default ImageSlider;
export { ImageSlider };

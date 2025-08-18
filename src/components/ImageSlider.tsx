import { useState, useEffect, useCallback, memo } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { getPlaceholderImage, handleImageError } from "@/utils/placeholders";

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

const OptimizedImage = memo(({ src, alt, onClick, isActive }: {
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
      {error && (
        <div className="absolute inset-0 bg-muted flex items-center justify-center">
          <img
            src={getPlaceholderImage('ana-sayfa-slider')}
            alt="Placeholder"
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.currentTarget;
              target.style.display = 'none';
              const parent = target.parentElement;
              if (parent) {
                parent.innerHTML = '<p class="text-muted-foreground text-sm">Görsel yüklenemedi</p>';
              }
            }}
          />
        </div>
      )}
      <img
        src={src}
        alt={alt}
        className={cn(
          "w-full h-full object-cover cursor-pointer transition-opacity duration-300",
          loaded ? "opacity-100" : "opacity-0"
        )}
        onClick={onClick}
        onLoad={() => setLoaded(true)}
        onError={(e) => {
          // İlk önce placeholder dene
          const target = e.currentTarget;
          if (!target.src.includes('trae-api-sg.mchost.guru')) {
            const placeholderUrl = getPlaceholderImage('ana-sayfa-slider');
            target.src = placeholderUrl;
          } else {
            setError(true);
          }
        }}
        loading={isActive ? "eager" : "lazy"}
        decoding="async"
      />
    </div>
  );
});

OptimizedImage.displayName = "OptimizedImage";

export const ImageSlider = memo(({ slides, autoPlay = true, interval = 5000, onImageClick }: ImageSliderProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(index);
  }, []);

  const goToPrevious = useCallback(() => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  }, [slides.length]);

  const goToNext = useCallback(() => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  }, [slides.length]);

  const handleImageClick = useCallback(() => {
    if (onImageClick) {
      onImageClick(currentSlide);
    }
  }, [onImageClick, currentSlide]);

  // Otomatik geçiş
  useEffect(() => {
    if (!autoPlay || slides.length <= 1) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, interval);
    return () => clearInterval(timer);
  }, [autoPlay, interval, slides.length]);

  // Klavye navigasyonu
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowLeft") {
        goToPrevious();
      } else if (event.key === "ArrowRight") {
        goToNext();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevious, goToNext]);

  if (slides.length === 0) {
    return (
      <div className="relative h-64 bg-muted rounded-xl flex items-center justify-center">
        <p className="text-muted-foreground">Henüz görsel eklenmemiş</p>
      </div>
    );
  }

  return (
    <div className="relative h-64 md:h-80 lg:h-[28rem] rounded-xl overflow-hidden group">
      {/* Görseller */}
      <div className="relative h-full">
        {slides.map((slide, index) => (
          <div
            key={slide.id}
            className={cn(
              "absolute inset-0 transition-opacity duration-500",
              index === currentSlide ? "opacity-100" : "opacity-0"
            )}
          >
            <OptimizedImage
              src={slide.image}
              alt={slide.title}
              onClick={handleImageClick}
              isActive={index === currentSlide}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
          </div>
        ))}
      </div>

      {/* Navigasyon Okları */}
      {slides.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToPrevious}
            aria-label="Önceki görsel"
          >
            <ChevronLeft className="h-6 w-6" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/20 hover:bg-black/40 text-white opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={goToNext}
            aria-label="Sonraki görsel"
          >
            <ChevronRight className="h-6 w-6" />
          </Button>
        </>
      )}

      {/* Nokta Göstergeleri */}
      {slides.length > 1 && (
        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={cn(
                "w-2 h-2 rounded-full transition-all",
                index === currentSlide
                  ? "bg-white scale-125"
                  : "bg-white/50 hover:bg-white/75"
              )}
              aria-label={`${index + 1}. görsele git`}
            />
          ))}
        </div>
      )}
    </div>
  );
});

ImageSlider.displayName = "ImageSlider";

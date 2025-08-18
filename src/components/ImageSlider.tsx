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

const ImageSlider = ({ slides, onImageClick }: ImageSliderProps) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [touchStart, setTouchStart] = useState(0);
  const [touchEnd, setTouchEnd] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // CORB hatası önlemi: Slider görselleri deaktif edildi
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

  // CORB hatası nedeniyle slider deaktif - sadece placeholder döndür
  return (
    <div className="relative w-full h-64 sm:h-80 md:h-96 bg-gradient-to-r from-warm-orange to-coral-pink rounded-lg flex items-center justify-center">
      <div className="text-center text-white">
        <ImageIcon className="w-12 h-12 mx-auto mb-2" />
        <h3 className="text-lg font-semibold mb-1">Kumlu Folyo</h3>
        <p className="text-sm opacity-90">Profesyonel Cam Kumlama ve Folyo Hizmetleri</p>
      </div>
    </div>
  );
};

ImageSlider.displayName = "ImageSlider";

export default ImageSlider;
export { ImageSlider };

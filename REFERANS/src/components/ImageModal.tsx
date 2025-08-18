import { useState, useEffect } from "react";
import { X, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageModalProps {
  images: Array<{ id: string; image: string; title: string; description: string }>;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ImageModal = ({ images, currentIndex, onClose, onNext, onPrev }: ImageModalProps) => {
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    // Scroll to current image when modal opens or index changes
    const scrollToImage = () => {
      const imageHeight = window.innerHeight;
      const targetScroll = currentIndex * imageHeight;
      setScrollPosition(targetScroll);
    };

    scrollToImage();
  }, [currentIndex]);

  if (currentIndex < 0 || currentIndex >= images.length) return null;

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const scrollTop = e.currentTarget.scrollTop;
    const imageHeight = window.innerHeight;
    const newIndex = Math.round(scrollTop / imageHeight);
    
    if (newIndex !== currentIndex && newIndex >= 0 && newIndex < images.length) {
      // Update index based on scroll position
      if (newIndex > currentIndex) {
        onNext();
      } else {
        onPrev();
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black z-50">
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Navigation buttons */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1/2 left-4 -translate-y-1/2 text-white hover:bg-white/20 z-10"
        onClick={onPrev}
        disabled={currentIndex === 0}
      >
        <ChevronUp className="h-6 w-6" />
      </Button>
      
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1/2 right-4 -translate-y-1/2 text-white hover:bg-white/20 z-10"
        onClick={onNext}
        disabled={currentIndex === images.length - 1}
      >
        <ChevronDown className="h-6 w-6" />
      </Button>

      {/* Instagram-style vertical scrolling */}
      <div 
        className="h-full overflow-y-auto snap-y snap-mandatory"
        onScroll={handleScroll}
        style={{ scrollBehavior: 'smooth' }}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            className="h-screen flex flex-col items-center justify-center snap-start p-4"
          >
            <div className="relative w-full max-w-md mx-auto">
              <img
                src={image.image}
                alt={image.title}
                className="w-full h-auto max-h-[70vh] object-contain rounded-lg"
              />
              
              {/* Image info */}
              <div className="mt-4 text-center text-white">
                <h3 className="text-lg font-semibold mb-2">{image.title}</h3>
                <p className="text-white/80 text-sm">{image.description}</p>
                <p className="text-xs text-white/60 mt-2">
                  {index + 1} / {images.length}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex space-x-1">
        {images.map((_, index) => (
          <div
            key={index}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex ? 'bg-white' : 'bg-white/40'
            }`}
          />
        ))}
      </div>
    </div>
  );
};
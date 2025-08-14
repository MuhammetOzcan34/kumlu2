import { useRef, useEffect } from "react";
import { X, ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ImageModalProps {
  images: Array<{ id: string; image: string; title: string; description: string }>;
  currentIndex: number;
  onClose: () => void;
  onNext: () => void;
  onPrev: () => void;
}

export const ImageModal = ({ images, currentIndex, onClose, onNext, onPrev }: ImageModalProps) => {
  const imageRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const targetNode = imageRefs.current[currentIndex];
    if (targetNode) {
      targetNode.scrollIntoView({ behavior: "auto", block: "start" });
    }
  }, [currentIndex]);

  if (currentIndex < 0 || currentIndex >= images.length) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black z-[9999] lg:ml-64 lg:bottom-0 lg:top-0 lg:right-0 pb-20 lg:pb-0">
      {/* Kapatma */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-4 right-4 text-white hover:bg-white/20 z-10"
        onClick={onClose}
      >
        <X className="h-6 w-6" />
      </Button>

      {/* Önceki */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1/2 left-4 -translate-y-1/2 text-white hover:bg-white/20 z-10"
        onClick={onPrev}
        disabled={currentIndex === 0}
      >
        <ChevronLeft className="h-6 w-6" />
      </Button>

      {/* Sonraki */}
      <Button
        variant="ghost"
        size="icon"
        className="absolute top-1/2 right-4 -translate-y-1/2 text-white hover:bg-white/20 z-10"
        onClick={onNext}
        disabled={currentIndex === images.length - 1}
      >
        <ChevronRight className="h-6 w-6" />
      </Button>

      <div
        className="h-full overflow-y-auto snap-y snap-mandatory"
        style={{ scrollSnapType: "y mandatory" }}
      >
        {images.map((image, index) => (
          <div
            key={image.id}
            ref={(el) => (imageRefs.current[index] = el)}
            className="w-full flex items-center justify-center snap-start relative"
            style={{
              height: "100vh",
              borderBottom: "1px solid rgba(255,255,255,0.1)",
            }}
          >
            {/* Fotoğraf numarası */}
            <div className="absolute top-2 left-2 bg-black/70 text-white text-xs sm:text-sm px-2 py-1 rounded-full z-20">
              {index + 1} / {images.length}
            </div>

            {/* Fotoğraf */}
            <div className="relative w-full flex justify-center items-center h-full">
              <img
                src={image.image}
                alt={image.title}
                className="object-contain w-auto h-full max-h-full"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: string;
    baslik: string;
    youtube_id: string | null;
    aciklama: string | null;
  } | null;
}

export const VideoModal = ({ isOpen, onClose, video }: VideoModalProps) => {
  if (!video) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl w-full h-[80vh] p-0">
        <DialogHeader className="p-6 pb-4">
          <DialogTitle className="text-xl font-semibold">{video.baslik}</DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 px-6 pb-6">
          {video.youtube_id ? (
            <div className="aspect-video w-full">
              <iframe
                src={`https://www.youtube.com/embed/${video.youtube_id}?autoplay=1`}
                title={video.baslik}
                className="w-full h-full rounded-lg"
                frameBorder="0"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            </div>
          ) : (
            <div className="aspect-video w-full bg-muted flex items-center justify-center rounded-lg">
              <p className="text-muted-foreground">Video yüklenemedi</p>
            </div>
          )}
          
          {video.aciklama && (
            <div className="mt-4">
              <p className="text-muted-foreground">{video.aciklama}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
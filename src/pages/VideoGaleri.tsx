import { PhoneButton } from "@/components/PhoneButton";
import { MobileNavigation } from "@/components/MobileNavigation";
import { HamburgerMenu } from "@/components/HamburgerMenu";
import { DesktopSidebar } from "@/components/DesktopSidebar";
import { VideoModal } from "@/components/VideoModal";
import { useSetting } from "@/hooks/useSettings";
import { useVideos } from "@/hooks/useVideos";
import { Play } from "lucide-react";
import React, { useState, useCallback } from "react";

interface Video {
  id: string;
  baslik: string;
  aciklama?: string;
  kategori?: string;
  thumbnail_url?: string;
  video_url?: string;
}

const VideoGaleri = () => {
  const phoneNumber = useSetting("telefon") || "+90 555 123 45 67";
  const { videos, loading } = useVideos();
  const [selectedVideo, setSelectedVideo] = useState<Video | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleVideoClick = useCallback((video: Video) => {
    setSelectedVideo(video);
    setIsModalOpen(true);
  }, []);

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
            <h1 className="text-3xl font-bold mb-4">Video Galeri</h1>
            <p className="text-muted-foreground">
              Çalışmalarımızı video olarak inceleyin
            </p>
          </div>
          
          {/* Video Grid */}
          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : videos.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {videos.map((video) => (
                <div key={video.id} className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative aspect-video bg-muted cursor-pointer" onClick={() => handleVideoClick(video)}>
                    <img 
                      src={video.thumbnail_url || ''} 
                      alt={video.baslik}
                      className="w-full h-full object-cover"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                      }}
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors">
                      <Play className="w-12 h-12 text-white" />
                    </div>
                  </div>
                  <div className="p-4">
                    <h3 className="font-semibold mb-2">{video.baslik}</h3>
                    {video.aciklama && (
                      <p className="text-sm text-muted-foreground">{video.aciklama}</p>
                    )}
                    {video.kategori && (
                      <span className="inline-block mt-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full">
                        {video.kategori}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-muted-foreground">Henüz video eklenmemiş.</p>
            </div>
          )}
        </div>
      </main>
      
      {/* Mobile Navigation */}
      <MobileNavigation />
      
      {/* Video Modal */}
      <VideoModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        video={selectedVideo} 
      />
    </div>
  );
};

// React.memo ile bileşeni optimize et
const MemoizedVideoGaleri = React.memo(VideoGaleri);
MemoizedVideoGaleri.displayName = 'VideoGaleri';

export default MemoizedVideoGaleri;
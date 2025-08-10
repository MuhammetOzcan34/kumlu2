import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Instagram } from "lucide-react";

interface InstagramPost {
  id: string;
  media_url: string;
  caption: string;
  timestamp: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  permalink: string;
}

export const InstagramFeed = () => {
  const instagramUsername = localStorage.getItem("instagram_username") || "";
  const instagramAccessToken = localStorage.getItem("instagram_access_token") || "";
  const instagramEnabled = localStorage.getItem("instagram_enabled") === "true";
  const instagramPostCount = parseInt(localStorage.getItem("instagram_post_count") || "6");
  const instagramCacheDuration = parseInt(localStorage.getItem("instagram_cache_duration") || "3600");
  
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(instagramPostCount);

  // Eğer Instagram aktif değilse veya access token ayarlanmamışsa bileşeni gösterme
  if (!instagramEnabled || !instagramAccessToken) {
    return null;
  }

  useEffect(() => {
    loadInstagramPosts();
  }, [instagramUsername, instagramPostCount]);

  const loadInstagramPosts = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Önce cache'den kontrol et
      const cached = localStorage.getItem(`instagram_posts_${instagramUsername}`);
      const cacheTime = localStorage.getItem(`instagram_cache_time_${instagramUsername}`);
      
      if (cached && cacheTime) {
        const now = Date.now();
        const cacheAge = now - parseInt(cacheTime);
        
        if (cacheAge < instagramCacheDuration * 1000) {
          // Cache geçerli, kullan
          setPosts(JSON.parse(cached));
          setLoading(false);
          return;
        }
      }

      // API'den yeni veri al
      const { instagramAPI } = await import('@/api/instagram');
      const data = await instagramAPI.getPosts(instagramAccessToken, instagramPostCount);
      
      if (data.success && data.posts) {
        setPosts(data.posts);
        
        // Cache'e kaydet
        localStorage.setItem(`instagram_posts_${instagramUsername}`, JSON.stringify(data.posts));
        localStorage.setItem(`instagram_cache_time_${instagramUsername}`, Date.now().toString());
      } else {
        throw new Error(data.error || "Instagram verileri alınamadı");
      }
    } catch (err) {
      console.error("Instagram yükleme hatası:", err);
      setError(err instanceof Error ? err.message : "Bilinmeyen hata");
      
      // Hata durumunda boş liste göster
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadMorePosts = () => {
    setDisplayCount(prevCount => prevCount + 6);
  };

  const formatDate = (timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const truncateCaption = (caption: string, maxLength: number = 100) => {
    if (caption.length <= maxLength) return caption;
    return caption.substring(0, maxLength) + '...';
  };

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Instagram className="h-6 w-6" />
          Instagram Paylaşımları
        </h2>
        <p className="text-muted-foreground">En son paylaşımlarımızı görün</p>
      </div>
      
      {/* Hata mesajı */}
      {error && (
        <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4 text-center">
          <p className="text-destructive text-sm">{error}</p>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={loadInstagramPosts}
            className="mt-2"
          >
            Tekrar Dene
          </Button>
        </div>
      )}
      
      {/* Instagram tarzı dikey liste */}
      <div className="space-y-6 max-w-md mx-auto">
        {posts.slice(0, displayCount).map((post) => (
          <div key={post.id} className="bg-card rounded-xl overflow-hidden shadow-lg">
            {/* Header */}
            <div className="flex items-center p-4">
              <div className="w-8 h-8 bg-gradient-to-r from-primary to-accent rounded-full mr-3 flex items-center justify-center">
                <Instagram className="h-4 w-4 text-white" />
              </div>
              <div>
                <h4 className="font-semibold text-sm">@{instagramUsername}</h4>
                <p className="text-xs text-muted-foreground">{formatDate(post.timestamp)}</p>
              </div>
            </div>
            
            {/* Image/Video */}
            <div className="aspect-square bg-muted relative">
              {post.media_type === 'VIDEO' && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  VIDEO
                </div>
              )}
              {post.media_type === 'CAROUSEL_ALBUM' && (
                <div className="absolute top-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded">
                  ALBÜM
                </div>
              )}
              <img 
                src={post.media_url} 
                alt={post.caption}
                className="w-full h-full object-cover"
                loading="lazy"
              />
            </div>
            
            {/* Caption */}
            <div className="p-4">
              <p className="text-sm">{truncateCaption(post.caption)}</p>
              <a 
                href={post.permalink} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary text-xs hover:underline mt-2 inline-block"
              >
                Instagram'da görüntüle →
              </a>
            </div>
          </div>
        ))}
      </div>
      
      {/* Loading indicator */}
      {loading && (
        <div className="text-center py-4">
          <RefreshCw className="h-6 w-6 animate-spin mx-auto mb-2" />
          <p className="text-sm text-muted-foreground">Instagram paylaşımları yükleniyor...</p>
        </div>
      )}
      
      {/* Load More Button */}
      {displayCount < posts.length && !loading && (
        <div className="text-center">
          <Button 
            onClick={loadMorePosts}
            variant="outline"
            className="btn-mobile"
          >
            Daha Fazla Yükle
          </Button>
        </div>
      )}
      
      {/* Refresh Button */}
      {!loading && posts.length > 0 && (
        <div className="text-center">
          <Button 
            onClick={loadInstagramPosts}
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground"
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Yenile
          </Button>
        </div>
      )}
    </div>
  );
};
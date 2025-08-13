import { useState, useEffect, useCallback, memo } from "react";
import { Button } from "@/components/ui/button";
import { RefreshCw, Instagram } from "lucide-react";
import { ElfsightInstagramFeed } from "./ElfsightInstagramFeed";

interface InstagramPost {
  id: string;
  media_url: string;
  caption: string;
  timestamp: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  permalink: string;
}

// Optimize edilmiş Instagram post bileşeni
const InstagramPostCard = memo(({ post, onClick }: {
  post: InstagramPost;
  onClick: () => void;
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageError, setImageError] = useState(false);

  const formatDate = useCallback((timestamp: string) => {
    return new Date(timestamp).toLocaleDateString('tr-TR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  }, []);

  const truncateCaption = useCallback((caption: string, maxLength: number = 100) => {
    if (caption.length <= maxLength) return caption;
    return caption.substring(0, maxLength) + '...';
  }, []);

  return (
    <div className="bg-card rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow cursor-pointer group"
         onClick={onClick}>
      <div className="relative aspect-square">
        {!imageLoaded && !imageError && (
          <div className="absolute inset-0 bg-muted animate-pulse flex items-center justify-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        )}
        {imageError && (
          <div className="absolute inset-0 bg-muted flex items-center justify-center">
            <p className="text-muted-foreground text-xs">Görsel yüklenemedi</p>
          </div>
        )}
        <img
          src={post.media_url}
          alt={post.caption || 'Instagram görseli'}
          className={`w-full h-full object-cover transition-all duration-300 group-hover:scale-105 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          onLoad={() => setImageLoaded(true)}
          onError={() => setImageError(true)}
          loading="lazy"
          decoding="async"
        />
        {post.media_type === 'VIDEO' && (
          <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
            <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M6.3 2.841A1.5 1.5 0 004 4.11V15.89a1.5 1.5 0 002.3 1.269l9.344-5.89a1.5 1.5 0 000-2.538L6.3 2.84z" />
            </svg>
          </div>
        )}
        {post.media_type === 'CAROUSEL_ALBUM' && (
          <div className="absolute top-2 right-2 bg-black/50 rounded-full p-1">
            <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
              <circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21,15 16,10 5,21"/>
            </svg>
          </div>
        )}
      </div>
      <div className="p-3">
        <p className="text-sm text-muted-foreground mb-2">
          {formatDate(post.timestamp)}
        </p>
        {post.caption && (
          <p className="text-sm line-clamp-3">
            {truncateCaption(post.caption)}
          </p>
        )}
      </div>
    </div>
  );
});

InstagramPostCard.displayName = "InstagramPostCard";

export const InstagramFeed = memo(() => {
  const [widgetType, setWidgetType] = useState<'elfsight' | 'api'>('elfsight');
  const instagramEnabled = localStorage.getItem("instagram_enabled") === "true";
  
  useEffect(() => {
    const type = localStorage.getItem("instagram_widget_type") as 'elfsight' | 'api';
    setWidgetType(type || 'elfsight');
  }, []);

  // Instagram aktif değilse bileşeni gösterme
  if (!instagramEnabled) {
    return null;
  }

  // Widget tipine göre uygun bileşeni göster
  if (widgetType === 'elfsight') {
    return <ElfsightInstagramFeed />;
  }

  // Mevcut API tabanlı Instagram feed (eski kod)
  return <APIInstagramFeed />;
});

// Mevcut API tabanlı Instagram feed bileşeni
const APIInstagramFeed = memo(() => {
  const instagramUsername = localStorage.getItem("instagram_username") || "";
  const instagramAccessToken = localStorage.getItem("instagram_access_token") || "";
  const instagramPostCount = parseInt(localStorage.getItem("instagram_post_count") || "6");
  const instagramCacheDuration = parseInt(localStorage.getItem("instagram_cache_duration") || "3600");
  
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [displayCount, setDisplayCount] = useState(instagramPostCount);

  // Eğer access token ayarlanmamışsa bileşeni gösterme
  if (!instagramAccessToken) {
    return null;
  }

  const loadInstagramPosts = useCallback(async () => {
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
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, [instagramUsername, instagramAccessToken, instagramPostCount, instagramCacheDuration]);

  const loadMorePosts = useCallback(() => {
    setDisplayCount(prevCount => prevCount + 6);
  }, []);

  const handlePostClick = useCallback((post: InstagramPost) => {
    window.open(post.permalink, '_blank', 'noopener,noreferrer');
  }, []);

  useEffect(() => {
    loadInstagramPosts();
  }, [loadInstagramPosts]);

  const displayedPosts = posts.slice(0, displayCount);

  return (
    <div className="space-y-4">
      <div className="text-center">
        <h2 className="text-2xl font-bold mb-2 flex items-center justify-center gap-2">
          <Instagram className="h-6 w-6 text-pink-500" />
          Instagram
        </h2>
        <p className="text-muted-foreground mb-4">
          @{instagramUsername} hesabımızdan son paylaşımlar
        </p>
      </div>

      {loading && posts.length === 0 && (
        <div className="flex justify-center py-8">
          <div className="flex items-center space-x-2">
            <RefreshCw className="h-5 w-5 animate-spin" />
            <span>Instagram gönderileri yükleniyor...</span>
          </div>
        </div>
      )}

      {error && (
        <div className="text-center py-8">
          <p className="text-red-500 mb-4">{error}</p>
          <Button onClick={loadInstagramPosts} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Tekrar Dene
          </Button>
        </div>
      )}

      {displayedPosts.length > 0 && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedPosts.map((post) => (
              <InstagramPostCard
                key={post.id}
                post={post}
                onClick={() => handlePostClick(post)}
              />
            ))}
          </div>

          {displayCount < posts.length && (
            <div className="text-center">
              <Button onClick={loadMorePosts} variant="outline">
                Daha Fazla Göster ({posts.length - displayCount} kaldı)
              </Button>
            </div>
          )}
        </>
      )}

      <div className="text-center">
        <Button onClick={loadInstagramPosts} variant="ghost" size="sm">
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Yenile
        </Button>
      </div>
    </div>
  );
});

APIInstagramFeed.displayName = "APIInstagramFeed";
InstagramFeed.displayName = "InstagramFeed";
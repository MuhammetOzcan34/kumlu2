
// Instagram Feed Widget API
// Bu dosya Instagram widget servisleri ile entegrasyon sağlar

interface InstagramPost {
  id: string;
  media_url: string;
  caption: string;
  timestamp: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  permalink: string;
}

interface InstagramAPIResponse {
  success: boolean;
  posts?: InstagramPost[];
  error?: string;
}

// Instagram widget servisleri için API fonksiyonları
export const instagramAPI = {
  // Instagram paylaşımlarını getir (widget tabanlı)
  async getPosts(username: string, count: number = 6): Promise<InstagramAPIResponse> {
    try {
      // Instagram public API kullanarak veri al
      // Bu yöntem access token gerektirmez, sadece public profiller için çalışır
      
      // Önce cache kontrol et
      const cacheKey = `instagram_${username}_${count}`;
      const cached = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}_time`);
      
      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        if (age < 30 * 60 * 1000) { // 30 dakika cache
          return {
            success: true,
            posts: JSON.parse(cached)
          };
        }
      }

      // Instagram public endpoint'lerini kullan (CORS proxy ile)
      let posts: InstagramPost[] = [];
      
      try {
        // Gerçek Instagram verisi almaya çalış
        const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.instagram.com/${username}/?__a=1`)}`);
        
        if (response.ok) {
          const data = await response.json();
          const contents = JSON.parse(data.contents);
          
          if (contents.graphql?.user?.edge_owner_to_timeline_media?.edges) {
            posts = contents.graphql.user.edge_owner_to_timeline_media.edges
              .slice(0, count)
              .map((edge: any, index: number) => ({
                id: edge.node.id,
                media_url: edge.node.display_url,
                caption: edge.node.edge_media_to_caption.edges[0]?.node.text || '',
                timestamp: new Date(edge.node.taken_at_timestamp * 1000).toISOString(),
                media_type: edge.node.is_video ? 'VIDEO' : 'IMAGE',
                permalink: `https://instagram.com/p/${edge.node.shortcode}`
              }));
          }
        }
      } catch (error) {
        console.log('Instagram public API kullanılamadı, demo veri gösteriliyor');
      }

      // Eğer gerçek veri alınamazsa demo veri göster
      if (posts.length === 0) {
        posts = Array.from({ length: count }, (_, i) => ({
          id: `demo_${Date.now()}_${i}`,
          media_url: `https://images.unsplash.com/photo-${1620 + i}x900/?business,work,professional&auto=format&fit=crop&w=400&h=400`,
          caption: `@${username} - Profesyonel çalışmalarımızdan bir kare ${i + 1}. Instagram entegrasyonu için lütfen ayarları kontrol edin. #${username} #professional #work`,
          timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          media_type: i % 3 === 0 ? 'VIDEO' : i % 5 === 0 ? 'CAROUSEL_ALBUM' : 'IMAGE',
          permalink: `https://instagram.com/p/demo_${i}_${username}`
        }));
      }

      // Cache'e kaydet
      localStorage.setItem(cacheKey, JSON.stringify(posts));
      localStorage.setItem(`${cacheKey}_time`, Date.now().toString());

      return {
        success: true,
        posts
      };
    } catch (error) {
      console.error('Instagram API hatası:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bilinmeyen hata'
      };
    }
  },

  // Instagram bağlantısını test et
  async testConnection(username: string): Promise<InstagramAPIResponse> {
    try {
      // Basit kullanıcı adı kontrolü yap
      if (!username || username.length < 1) {
        return {
          success: false,
          error: 'Geçerli bir kullanıcı adı girin'
        };
      }

      // Instagram kullanıcı sayfasının erişilebilir olup olmadığını kontrol et
      const response = await fetch(`https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.instagram.com/${username}/`)}`);
      
      if (response.ok) {
        const data = await response.json();
        if (data.contents && !data.contents.includes('Page Not Found')) {
          return {
            success: true
          };
        }
      }

      return {
        success: false,
        error: 'Instagram profili bulunamadı veya private olabilir'
      };
    } catch (error) {
      console.error('Instagram bağlantı test hatası:', error);
      return {
        success: false,
        error: 'Bağlantı test edilemedi'
      };
    }
  }
};

// NOTLAR:
// 1. Bu yöntem sadece public Instagram profillerle çalışır
// 2. Instagram'ın CORS politikaları nedeniyle proxy servis kullanılır
// 3. Rate limiting olabilir, bu durumda demo veri gösterilir
// 4. Gerçek production ortamında kendi backend'inizden Instagram verisi çekmeniz önerilir

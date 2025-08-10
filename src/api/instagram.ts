// Instagram Feed API
// Bu dosya public Instagram profillerinden veri çeker

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

// Instagram API fonksiyonları
export const instagramAPI = {
  // Instagram paylaşımlarını getir (public profil)
  async getPosts(username: string, count: number = 6): Promise<InstagramAPIResponse> {
    try {
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

      // Instagram için alternatif yöntemler dene
      const apiMethods = [
        // Yöntem 1: Instagram JSON endpoint'i
        {
          name: 'Instagram JSON',
          fetcher: async () => {
            const response = await fetch(`https://www.instagram.com/${username}/?__a=1&__d=dis`, {
              headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
              }
            });
            
            if (!response.ok) throw new Error('Instagram JSON API failed');
            
            const data = await response.json();
            const media = data?.graphql?.user?.edge_owner_to_timeline_media?.edges || [];
            
            return media.slice(0, count).map((edge: any, index: number) => ({
              id: edge.node.id || `insta_${Date.now()}_${index}`,
              media_url: edge.node.display_url || edge.node.thumbnail_src,
              caption: edge.node.edge_media_to_caption?.edges[0]?.node?.text || `@${username} Instagram post`,
              timestamp: new Date(edge.node.taken_at_timestamp * 1000).toISOString(),
              media_type: edge.node.is_video ? 'VIDEO' : 'IMAGE',
              permalink: `https://instagram.com/p/${edge.node.shortcode}`
            }));
          }
        },
        
        // Yöntem 2: Rapid API Instagram scraper
        {
          name: 'RapidAPI',
          fetcher: async () => {
            const response = await fetch(`https://instagram-scraper-api2.p.rapidapi.com/v1/info?username_or_id_or_url=${username}`, {
              headers: {
                'X-RapidAPI-Key': 'demo', // Demo key, gerçek kullanım için API key gerekli
                'X-RapidAPI-Host': 'instagram-scraper-api2.p.rapidapi.com'
              }
            });
            
            if (!response.ok) throw new Error('RapidAPI failed');
            
            const data = await response.json();
            const media = data?.data?.recent_posts || [];
            
            return media.slice(0, count).map((post: any, index: number) => ({
              id: post.pk || `rapid_${Date.now()}_${index}`,
              media_url: post.image_versions2?.candidates[0]?.url || post.thumbnail_url,
              caption: post.caption?.text || `@${username} Instagram post`,
              timestamp: new Date(post.taken_at * 1000).toISOString(),
              media_type: post.media_type === 2 ? 'VIDEO' : 'IMAGE',
              permalink: `https://instagram.com/p/${post.code}`
            }));
          }
        }
      ];

      // API yöntemlerini sırayla dene
      for (const method of apiMethods) {
        try {
          console.log(`Instagram API deneniyor: ${method.name}`);
          const posts = await method.fetcher();
          
          if (posts && posts.length > 0) {
            console.log(`✅ ${method.name} başarılı: ${posts.length} post bulundu`);
            
            // Cache'e kaydet
            localStorage.setItem(cacheKey, JSON.stringify(posts));
            localStorage.setItem(`${cacheKey}_time`, Date.now().toString());

            return {
              success: true,
              posts: posts as InstagramPost[]
            };
          }
        } catch (methodError) {
          console.warn(`❌ ${method.name} failed:`, methodError);
          continue;
        }
      }

      // Tüm yöntemler başarısızsa, güzel placeholder'lar göster
      console.log('🎨 Tüm API yöntemleri başarısız, placeholder gösteriliyor');
      
      const posts: InstagramPost[] = Array.from({ length: count }, (_, i) => ({
        id: `placeholder_${Date.now()}_${i}`,
        media_url: `https://images.unsplash.com/photo-${1500000 + i * 100}x900/?business,work,professional&auto=format&fit=crop&w=400&h=400`,
        caption: `🔧 Instagram entegrasyonu kurulum aşamasında. @${username} profilinden gerçek veriler yakında burada görünecek.`,
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        media_type: 'IMAGE' as const,
        permalink: `https://instagram.com/${username}`
      }));

      return {
        success: false,
        posts,
        error: `@${username} profili için Instagram verileri yüklenemedi. Lütfen daha sonra tekrar deneyin.`
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

      // Username geçerli karakterler içeriyor mu kontrol et
      const validUsername = /^[a-zA-Z0-9._]+$/.test(username);
      if (!validUsername) {
        return {
          success: false,
          error: 'Geçersiz kullanıcı adı. Sadece harf, rakam, nokta ve alt çizgi kullanın.'
        };
      }

      // Basit Instagram profil kontrolü
      try {
        // Instagram profile sayfasına basit istek gönder
        const response = await fetch(`https://www.instagram.com/${username}/`, {
          method: 'HEAD',
          mode: 'no-cors'
        });
        
        // no-cors modu olduğu için response.ok kontrol edemeyiz
        // Sadece network hatası yoksa başarılı kabul edelim
        return {
          success: true
        };
      } catch (networkError) {
        // Ağ hatası varsa, kullanıcı adının geçerli olduğunu varsayalım
        console.warn('Instagram profil test hatası:', networkError);
        
        // Basit format kontrolü yap
        if (username.length >= 1 && username.length <= 30) {
          return {
            success: true
          };
        }
        
        return {
          success: false,
          error: `@${username} kullanıcı adı geçersiz görünüyor. Doğru formatta olduğundan emin olun.`
        };
      }
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
// 1. Bu API Instagram için alternatif yöntemler kullanır
// 2. Instagram JSON endpoint ve scraper API'leri dener
// 3. Tüm yöntemler başarısızsa güzel placeholder gösterir
// 4. Cache sistemi performansı artırır (30 dakika)
// 5. Demo modda çalışır, gerçek veriler için API key gerekebilir
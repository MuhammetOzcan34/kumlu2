

// Instagram Basic Display API
// Bu dosya resmi Instagram Basic Display API'sini kullanır

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

interface InstagramMediaResponse {
  data: {
    id: string;
    caption?: string;
    media_type: string;
    media_url: string;
    permalink: string;
    thumbnail_url?: string;
    timestamp: string;
  }[];
  paging?: {
    cursors: {
      before: string;
      after: string;
    };
    next?: string;
  };
}

// Instagram API fonksiyonları
export const instagramAPI = {
  // Instagram paylaşımlarını getir (Basic Display API)
  async getPosts(accessToken: string, count: number = 6): Promise<InstagramAPIResponse> {
    try {
      console.log(`📸 Instagram Basic Display API ile posts getiriliyor...`);

      if (!accessToken) {
        return {
          success: false,
          error: 'Instagram Access Token gerekli. Lütfen ayarlarda token ekleyin.'
        };
      }

      // Cache kontrolü
      const cacheKey = `instagram_basic_${accessToken.substring(0, 10)}_${count}`;
      const cached = localStorage.getItem(cacheKey);
      const cacheTime = localStorage.getItem(`${cacheKey}_time`);

      if (cached && cacheTime) {
        const age = Date.now() - parseInt(cacheTime);
        if (age < 10 * 60 * 1000) { // 10 dakika cache
          console.log('📦 Cache\'den Instagram verileri alındı');
          return {
            success: true,
            posts: JSON.parse(cached)
          };
        }
      }

      // Instagram Basic Display API endpoint
      const apiUrl = `https://graph.instagram.com/me/media?fields=id,caption,media_type,media_url,permalink,thumbnail_url,timestamp&access_token=${accessToken}&limit=${count}`;

      const response = await fetch(apiUrl);
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        
        if (response.status === 401) {
          return {
            success: false,
            error: 'Instagram Access Token geçersiz veya süresi dolmuş. Lütfen yeni token alın.'
          };
        }
        
        return {
          success: false,
          error: errorData.error?.message || `API Hatası: ${response.status}`
        };
      }

      const data: InstagramMediaResponse = await response.json();

      if (data.data && data.data.length > 0) {
        const posts: InstagramPost[] = data.data.map((item) => ({
          id: item.id,
          media_url: item.media_type === 'VIDEO' && item.thumbnail_url ? item.thumbnail_url : item.media_url,
          caption: item.caption || 'Instagram paylaşımı',
          timestamp: item.timestamp,
          media_type: item.media_type as 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM',
          permalink: item.permalink
        }));

        console.log(`✅ Instagram Basic Display API başarılı: ${posts.length} post bulundu`);

        // Cache'e kaydet
        localStorage.setItem(cacheKey, JSON.stringify(posts));
        localStorage.setItem(`${cacheKey}_time`, Date.now().toString());

        return {
          success: true,
          posts
        };
      } else {
        return {
          success: false,
          error: 'Instagram hesabınızda paylaşım bulunamadı.'
        };
      }

    } catch (error) {
      console.error('❌ Instagram Basic Display API hatası:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Instagram verileri yüklenemedi'
      };
    }
  },

  // Access token'ı test et
  async testConnection(accessToken: string): Promise<InstagramAPIResponse> {
    try {
      if (!accessToken) {
        return {
          success: false,
          error: 'Access Token gerekli'
        };
      }

      console.log('🔍 Instagram Access Token test ediliyor...');

      // Kullanıcı bilgilerini al
      const userUrl = `https://graph.instagram.com/me?fields=id,username,media_count&access_token=${accessToken}`;
      
      const response = await fetch(userUrl);
      
      if (response.ok) {
        const userData = await response.json();
        console.log('✅ Instagram bağlantısı başarılı:', userData);
        
        return {
          success: true
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        
        return {
          success: false,
          error: errorData.error?.message || 'Access Token geçersiz'
        };
      }
    } catch (error) {
      console.error('❌ Instagram test hatası:', error);
      return {
        success: false,
        error: 'Bağlantı test edilemedi'
      };
    }
  },

  // Long-lived token al (60 gün geçerli)
  async getLongLivedToken(shortLivedToken: string): Promise<{success: boolean, token?: string, error?: string}> {
    try {
      const appId = 'YOUR_APP_ID'; // Bu değeri Meta Developers'dan alacaksınız
      const appSecret = 'YOUR_APP_SECRET'; // Bu değeri Meta Developers'dan alacaksınız
      
      const url = `https://graph.instagram.com/access_token?grant_type=ig_exchange_token&client_secret=${appSecret}&access_token=${shortLivedToken}`;
      
      const response = await fetch(url, { method: 'GET' });
      
      if (response.ok) {
        const data = await response.json();
        return {
          success: true,
          token: data.access_token
        };
      } else {
        const errorData = await response.json().catch(() => ({}));
        return {
          success: false,
          error: errorData.error?.message || 'Token dönüştürülemedi'
        };
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Token dönüştürme hatası'
      };
    }
  }
};


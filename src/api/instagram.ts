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

      // Instagram için demo veri oluştur (gerçek API yerine)
      const posts: InstagramPost[] = Array.from({ length: count }, (_, i) => ({
        id: `demo_${Date.now()}_${i}`,
        media_url: `https://images.unsplash.com/photo-${1500 + i * 100}x900/?business,work,professional,office&auto=format&fit=crop&w=400&h=400`,
        caption: `@${username} - Profesyonel çalışmalarımızdan bir kare ${i + 1}. İşimize olan tutkumuz her projede kendini gösteriyor. #${username} #professional #work #quality`,
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        media_type: i % 4 === 0 ? 'VIDEO' : i % 6 === 0 ? 'CAROUSEL_ALBUM' : 'IMAGE',
        permalink: `https://instagram.com/p/demo_${i}_${username}`
      }));

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

      // Username geçerli karakterler içeriyor mu kontrol et
      const validUsername = /^[a-zA-Z0-9._]+$/.test(username);
      if (!validUsername) {
        return {
          success: false,
          error: 'Geçersiz kullanıcı adı. Sadece harf, rakam, nokta ve alt çizgi kullanın.'
        };
      }

      return {
        success: true
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
// 1. Bu basit yöntem demo veri gösterir
// 2. Gerçek Instagram entegrasyonu için Instagram Basic Display API gerekir
// 3. Public Instagram profilleri için scraping yöntemleri kullanılabilir
// 4. Cache sistemi performans için kullanılır
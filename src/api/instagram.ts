
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
  // Instagram paylaşımlarını getir (gerçek profil verisi)
  async getPosts(username: string, count: number = 6): Promise<InstagramAPIResponse> {
    try {
      console.log(`📸 Instagram posts getiriliyor: @${username}`);

      // Cache kontrolü
      const cacheKey = `instagram_${username}_${count}`;
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

      // Instagram RSS alternatifi kullan (Picuki.com API)
      try {
        const proxyUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.picuki.com/profile/${username}`)}`;
        
        const response = await fetch(proxyUrl, {
          headers: {
            'Accept': 'application/json',
          }
        });

        if (response.ok) {
          const data = await response.json();
          const htmlContent = data.contents;
          
          // HTML'den post verilerini çıkar
          const posts = this.parseInstagramPosts(htmlContent, username, count);
          
          if (posts.length > 0) {
            console.log(`✅ Instagram API başarılı: ${posts.length} post bulundu`);

            // Cache'e kaydet
            localStorage.setItem(cacheKey, JSON.stringify(posts));
            localStorage.setItem(`${cacheKey}_time`, Date.now().toString());

            return {
              success: true,
              posts
            };
          }
        }
      } catch (apiError) {
        console.warn('⚠️ Instagram API hatası:', apiError);
      }

      // Alternatif yöntem: Instagram Basic Display API benzeri
      try {
        const alternativeUrl = `https://instagram.com/${username}/channel/?__a=1&__d=dis`;
        
        const response = await fetch(alternativeUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15',
            'Accept': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
          }
        });

        if (response.ok) {
          const data = await response.json();
          console.log('Instagram alternatif API yanıtı:', data);
          
          // Veri yapısına göre post'ları çıkar
          const posts = this.parseAlternativeResponse(data, username, count);
          
          if (posts.length > 0) {
            localStorage.setItem(cacheKey, JSON.stringify(posts));
            localStorage.setItem(`${cacheKey}_time`, Date.now().toString());
            
            return {
              success: true,
              posts
            };
          }
        }
      } catch (altError) {
        console.warn('⚠️ Instagram alternatif API hatası:', altError);
      }

      // Her iki yöntem de başarısızsa hata döndür
      console.error('❌ Instagram verileri alınamadı');
      return {
        success: false,
        error: `@${username} profili için Instagram verileri alınamadı. Profil public olduğundan emin olun.`
      };

    } catch (error) {
      console.error('❌ Instagram API genel hatası:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Instagram verileri yüklenemedi'
      };
    }
  },

  // HTML içeriğinden post'ları çıkar
  parseInstagramPosts(htmlContent: string, username: string, count: number): InstagramPost[] {
    const posts: InstagramPost[] = [];
    
    try {
      // HTML'den post linklerini bul
      const postRegex = /\/p\/([A-Za-z0-9_-]+)\//g;
      const imageRegex = /https:\/\/[^"]*\.jpg|https:\/\/[^"]*\.jpeg/g;
      
      const postMatches = [...htmlContent.matchAll(postRegex)];
      const imageMatches = [...htmlContent.matchAll(imageRegex)];
      
      for (let i = 0; i < Math.min(count, postMatches.length, imageMatches.length); i++) {
        const shortcode = postMatches[i][1];
        const imageUrl = imageMatches[i][0];
        
        posts.push({
          id: `${username}_${shortcode}`,
          media_url: imageUrl,
          caption: `@${username} Instagram paylaşımı`,
          timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
          media_type: 'IMAGE' as const,
          permalink: `https://instagram.com/p/${shortcode}/`
        });
      }
    } catch (parseError) {
      console.warn('⚠️ HTML parse hatası:', parseError);
    }
    
    return posts;
  },

  // Alternatif API yanıtını işle
  parseAlternativeResponse(data: any, username: string, count: number): InstagramPost[] {
    const posts: InstagramPost[] = [];
    
    try {
      // API yanıt yapısına göre veriyi çıkar
      const items = data?.items || data?.data?.items || data?.graphql?.user?.edge_owner_to_timeline_media?.edges || [];
      
      for (let i = 0; i < Math.min(count, items.length); i++) {
        const item = items[i];
        const node = item.node || item;
        
        posts.push({
          id: node.id || `${username}_${i}`,
          media_url: node.display_url || node.image_versions2?.candidates?.[0]?.url || node.media_url,
          caption: node.caption?.text || node.caption || `@${username} paylaşımı`,
          timestamp: new Date((node.taken_at || node.taken_at_timestamp || Date.now() / 1000) * 1000).toISOString(),
          media_type: node.media_type === 2 ? 'VIDEO' : 'IMAGE',
          permalink: `https://instagram.com/p/${node.code || node.shortcode}/`
        });
      }
    } catch (parseError) {
      console.warn('⚠️ Alternatif parse hatası:', parseError);
    }
    
    return posts;
  },

  // Instagram bağlantısını test et
  async testConnection(username: string): Promise<InstagramAPIResponse> {
    try {
      if (!username || username.length < 1) {
        return {
          success: false,
          error: 'Geçerli bir Instagram kullanıcı adı girin'
        };
      }

      // Username format kontrolü
      const validUsername = /^[a-zA-Z0-9._]+$/.test(username);
      if (!validUsername) {
        return {
          success: false,
          error: 'Geçersiz kullanıcı adı formatı. Sadece harf, rakam, nokta ve alt çizgi kullanın.'
        };
      }

      console.log(`🔍 Instagram profili test ediliyor: @${username}`);

      // Gerçek test için basit bir istek yap
      const testUrl = `https://api.allorigins.win/get?url=${encodeURIComponent(`https://www.instagram.com/${username}/`)}`;
      const response = await fetch(testUrl);
      
      if (response.ok) {
        const data = await response.json();
        
        if (data.contents && !data.contents.includes('Page Not Found')) {
          return {
            success: true
          };
        } else {
          return {
            success: false,
            error: 'Instagram profili bulunamadı veya private'
          };
        }
      }

      return {
        success: false,
        error: 'Instagram profili kontrol edilemedi'
      };
    } catch (error) {
      console.error('❌ Instagram test hatası:', error);
      return {
        success: false,
        error: 'Bağlantı test edilemedi'
      };
    }
  }
};

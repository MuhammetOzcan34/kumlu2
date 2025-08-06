// Instagram API endpoint'leri
// Bu dosya Instagram Basic Display API ile entegrasyon sağlar

interface InstagramAPIResponse {
  success: boolean;
  posts?: InstagramPost[];
  error?: string;
}

interface InstagramPost {
  id: string;
  media_url: string;
  caption: string;
  timestamp: string;
  media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
  permalink: string;
}

// Instagram API endpoint'leri için proxy fonksiyonları
export const instagramAPI = {
  // Instagram paylaşımlarını getir
  async getPosts(username: string, count: number = 6): Promise<InstagramAPIResponse> {
    try {
      // Gerçek uygulamada bu endpoint backend'de olacak
      // Şimdilik mock veri döndürüyoruz
      
      // Instagram Basic Display API'den veri almak için:
      // 1. Access token ile /me/media endpoint'ini çağır
      // 2. Her media için detayları al
      // 3. Sonuçları formatla ve döndür
      
      // Mock veri - gerçek uygulamada bu kısım backend'de olacak
      const mockPosts: InstagramPost[] = Array.from({ length: count }, (_, i) => ({
        id: `instagram_${Date.now()}_${i}`,
        media_url: `https://images.unsplash.com/photo-${1620 + i}x900/?business,work,professional&auto=format&fit=crop&w=400&h=400`,
        caption: `Profesyonel çalışmalarımızdan bir kare ${i + 1} - @${username}`,
        timestamp: new Date(Date.now() - i * 24 * 60 * 60 * 1000).toISOString(),
        media_type: i % 3 === 0 ? 'VIDEO' : i % 5 === 0 ? 'CAROUSEL_ALBUM' : 'IMAGE',
        permalink: `https://instagram.com/p/mock_${i}_${username}`
      }));

      return {
        success: true,
        posts: mockPosts
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
  async testConnection(username: string, accessToken: string): Promise<InstagramAPIResponse> {
    try {
      // Gerçek uygulamada Instagram API'ye test isteği gönder
      // Şimdilik mock başarılı yanıt döndürüyoruz
      
      // Instagram Basic Display API test endpoint'i:
      // GET https://graph.instagram.com/me?fields=id,username&access_token={access-token}
      
      // Mock başarılı yanıt
      return {
        success: true
      };
    } catch (error) {
      console.error('Instagram bağlantı test hatası:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Bağlantı test edilemedi'
      };
    }
  }
};

// Gerçek Instagram API entegrasyonu için örnek kod:
/*
export const realInstagramAPI = {
  async getPosts(accessToken: string, count: number = 6): Promise<InstagramAPIResponse> {
    try {
      // 1. Kullanıcı bilgilerini al
      const userResponse = await fetch(
        `https://graph.instagram.com/me?fields=id,username&access_token=${accessToken}`
      );
      
      if (!userResponse.ok) {
        throw new Error('Instagram kullanıcı bilgileri alınamadı');
      }
      
      const userData = await userResponse.json();
      
      // 2. Medya listesini al
      const mediaResponse = await fetch(
        `https://graph.instagram.com/me/media?fields=id,media_type,media_url,caption,timestamp,permalink&access_token=${accessToken}&limit=${count}`
      );
      
      if (!mediaResponse.ok) {
        throw new Error('Instagram medya listesi alınamadı');
      }
      
      const mediaData = await mediaResponse.json();
      
      // 3. Sonuçları formatla
      const posts: InstagramPost[] = mediaData.data.map((item: any) => ({
        id: item.id,
        media_url: item.media_url,
        caption: item.caption || '',
        timestamp: item.timestamp,
        media_type: item.media_type,
        permalink: item.permalink
      }));
      
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
  }
};
*/ 
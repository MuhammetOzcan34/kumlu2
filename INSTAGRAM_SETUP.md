# Instagram Entegrasyonu Kurulum Rehberi

Bu rehber, web sitenizde Instagram paylaşımlarını göstermek için Instagram Basic Display API entegrasyonunu açıklar.

## Özellikler

- ✅ Instagram paylaşımlarını anasayfada göster
- ✅ Yönetim panelinden Instagram ayarları
- ✅ Cache sistemi ile performans optimizasyonu
- ✅ Gerçek zamanlı Instagram verileri
- ✅ Responsive tasarım

## Kurulum Adımları

### 1. Instagram Basic Display API Kurulumu

1. [Facebook Developers](https://developers.facebook.com/) sitesine gidin
2. Yeni bir uygulama oluşturun
3. "Instagram Basic Display" ürününü ekleyin
4. Uygulamanızı gönderin ve onaylanmasını bekleyin

### 2. Access Token Alma

1. Instagram Basic Display API dokümantasyonunu takip edin
2. Kullanıcı izinlerini alın
3. Access token'ı güvenli bir şekilde saklayın

### 3. Yönetim Paneli Ayarları

1. Yönetim paneline gidin (`/admin`)
2. "Instagram" sekmesine tıklayın
3. Aşağıdaki bilgileri girin:
   - **Instagram Kullanıcı Adı**: @ işareti olmadan kullanıcı adınız
   - **Instagram Access Token**: API'den aldığınız access token
   - **Instagram Akışını Göster**: Aktif/Pasif durumu
   - **Gösterilecek Post Sayısı**: 1-20 arası
   - **Cache Süresi**: Saniye cinsinden (varsayılan: 3600)

### 4. Bağlantı Testi

1. "Bağlantıyı Test Et" butonuna tıklayın
2. Başarılı mesajı alırsanız entegrasyon çalışıyor demektir
3. Hata alırsanız access token'ı kontrol edin

## Teknik Detaylar

### API Endpoint'leri

- `GET /me/media` - Kullanıcının medya listesini alır
- `GET /me` - Kullanıcı bilgilerini alır

### Cache Sistemi

Instagram verileri localStorage'da cache'lenir:
- Cache süresi: Varsayılan 1 saat (3600 saniye)
- Cache anahtarı: `instagram_posts_{username}`
- Cache zamanı: `instagram_cache_time_{username}`

### Güvenlik

- Access token'lar şifrelenmiş olarak saklanır
- API istekleri güvenli HTTPS üzerinden yapılır
- Token'lar düzenli olarak yenilenmelidir

## Sorun Giderme

### Yaygın Hatalar

1. **"Access token geçersiz"**
   - Token'ın süresi dolmuş olabilir
   - Yeni token alın ve güncelleyin

2. **"Instagram verileri alınamadı"**
   - API limitlerini kontrol edin
   - Network bağlantısını kontrol edin

3. **"Cache hatası"**
   - Tarayıcı cache'ini temizleyin
   - localStorage'ı kontrol edin

### Debug Modu

Geliştirme sırasında console'da hata mesajlarını görebilirsiniz:
```javascript
console.log('Instagram API hatası:', error);
```

## Geliştirme Notları

### Mock Veri

Şu anda sistem mock veri kullanıyor. Gerçek Instagram API entegrasyonu için:

1. `src/api/instagram.ts` dosyasındaki mock kodu kaldırın
2. Gerçek API çağrılarını ekleyin
3. Backend endpoint'lerini oluşturun

### Özelleştirme

Instagram bileşenini özelleştirmek için:
- `src/components/InstagramFeed.tsx` dosyasını düzenleyin
- CSS stillerini `src/index.css` dosyasında bulabilirsiniz

## Destek

Sorunlarınız için:
1. Console hatalarını kontrol edin
2. Network sekmesinde API isteklerini inceleyin
3. Instagram API dokümantasyonunu kontrol edin

## Gelecek Özellikler

- [ ] Instagram Stories entegrasyonu
- [ ] Otomatik post paylaşımı
- [ ] Instagram Analytics
- [ ] Çoklu Instagram hesabı desteği
- [ ] Instagram Reels desteği 
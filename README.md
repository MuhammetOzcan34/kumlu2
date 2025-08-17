# Kumlu Folyo - Profesyonel Hizmetler Web Sitesi

## Proje Açıklaması

Kumlu Folyo, cam kumlama, tabela ve dijital baskı hizmetleri sunan profesyonel bir şirketin modern web sitesidir. React, TypeScript ve Supabase teknolojileri kullanılarak geliştirilmiştir.

## Özellikler

### 🎨 Ana Özellikler
- **Responsive Tasarım**: Tüm cihazlarda mükemmel görünüm
- **PWA Desteği**: Mobil cihazlarda uygulama gibi çalışır
- **Dinamik İçerik Yönetimi**: Admin paneli ile kolay içerik güncellemesi
- **Fotoğraf Galerisi**: Kategorize edilmiş çalışma örnekleri
- **WhatsApp Entegrasyonu**: Hızlı iletişim widget'ı
- **Hesaplama Araçları**: Servis bedeli hesaplama modülleri

### 🛠️ Hizmet Alanları
- Cam Kumlama
- Tabela Üretimi
- Dijital Baskı
- Araç Giydirme
- Video Galeri
- Referans Çalışmaları

### 👨‍💼 Yönetim Paneli
- Fotoğraf yönetimi (yükleme, düzenleme, silme)
- Kategori yönetimi
- Firma ayarları (logo, iletişim bilgileri)
- Slider görsel yönetimi
- Kullanıcı yetkilendirmesi

## Teknoloji Stack

### Frontend
- **React 18** - Modern UI kütüphanesi
- **TypeScript** - Tip güvenliği
- **Vite** - Hızlı geliştirme ortamı
- **Tailwind CSS** - Utility-first CSS framework
- **Shadcn/ui** - Modern UI bileşenleri
- **React Query** - Veri yönetimi
- **React Router** - Sayfa yönlendirme
- **Zustand** - State yönetimi

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Veritabanı
- **Row Level Security (RLS)** - Güvenlik politikaları
- **Storage** - Dosya yönetimi

### Deployment
- **Vercel** - Hosting platformu
- **PWA** - Progressive Web App desteği

## Kurulum

### Gereksinimler
- Node.js 18+
- npm veya pnpm
- Supabase hesabı

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone [repository-url]
cd kumlu2-master-15.08
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Ortam değişkenlerini ayarlayın**
`.env` dosyası oluşturun:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

4. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

## Kullanılabilir Komutlar

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# TypeScript kontrolü
npm run type-check

# ESLint kontrolü
npm run lint

# Preview (build sonrası)
npm start
```

## Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── ui/             # Temel UI bileşenleri
│   ├── admin/          # Admin paneli bileşenleri
│   └── ...             # Diğer bileşenler
├── pages/              # Sayfa bileşenleri
├── hooks/              # Custom React hooks
├── contexts/           # React Context'ler
├── utils/              # Yardımcı fonksiyonlar
├── types/              # TypeScript tip tanımları
└── lib/                # Kütüphane konfigürasyonları

supabase/
├── migrations/         # Veritabanı migration dosyaları
└── config.toml         # Supabase konfigürasyonu

public/
├── manifest.json       # PWA manifest
├── sw.js              # Service Worker
└── ...                # Statik dosyalar
```

## Veritabanı Yapısı

### Ana Tablolar
- `fotograflar` - Fotoğraf galerisi
- `kategoriler` - Fotoğraf kategorileri
- `ayarlar` - Site ayarları
- `auth.users` - Kullanıcı yönetimi (Supabase Auth)

### Storage Buckets
- `fotograflar` - Fotoğraf dosyaları
- `watermark` - Filigran dosyaları
- `images` - Genel görsel dosyalar

## Güvenlik

- **Row Level Security (RLS)** tüm tablolarda aktif
- Admin yetkisi `admin@kumlu2.com` e-posta adresi ile sınırlı
- Dosya yükleme boyut ve tip kısıtlamaları
- CORS politikaları yapılandırılmış

## Önemli Özellikler

### PWA Desteği
- Offline çalışma kapasitesi
- Mobil cihazlarda uygulama gibi yükleme
- Push notification desteği (gelecek güncellemeler için)

### Performance Optimizasyonları
- Lazy loading
- Image optimization
- Code splitting
- Caching stratejileri

### SEO Optimizasyonu
- Meta tags
- Open Graph protokolü
- Twitter Cards
- Sitemap (gelecek güncellemeler için)

## Sorun Giderme

### Yaygın Sorunlar

1. **Supabase bağlantı hatası**
   - `.env` dosyasındaki anahtarları kontrol edin
   - Supabase projesinin aktif olduğundan emin olun

2. **Fotoğraf yükleme hatası**
   - Storage bucket izinlerini kontrol edin
   - Dosya boyutu limitlerini kontrol edin (max 50MB)

3. **Build hatası**
   - `npm run type-check` ile TypeScript hatalarını kontrol edin
   - `node_modules` klasörünü silip yeniden yükleyin

## Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## Lisans

Bu proje özel mülkiyettedir. Tüm hakları saklıdır.

## İletişim

- **Web**: [kumlufolyo.org](https://kumlufolyo.org)
- **E-posta**: info@kumlufolyo.org
- **Telefon**: +90 XXX XXX XX XX

## Güncellemeler

### Son Düzeltmeler (v1.0.1)
- ✅ Ayarlar tablosu RLS politikaları düzeltildi
- ✅ Storage bucket CORS ayarları güncellendi
- ✅ WhatsApp widget touchstart event'i passive yapıldı
- ✅ Performance optimizasyonları uygulandı

---

**Not**: Bu README dosyası projenin güncel durumunu yansıtmaktadır. Herhangi bir sorun yaşarsanız yukarıdaki sorun giderme bölümünü kontrol edin veya geliştirici ile iletişime geçin.
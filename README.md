# Kumlu Folyo Projesi

## 📋 Proje Hakkında

Kumlu Folyo, modern web teknolojileri kullanılarak geliştirilmiş bir React uygulamasıdır. Bu proje, folyo ve baskı hizmetleri için tasarlanmış kapsamlı bir web platformudur.

## 🚀 Teknolojiler

### Frontend
- **React 18.3.1** - Modern UI kütüphanesi
- **TypeScript** - Tip güvenliği için
- **Vite** - Hızlı geliştirme ve build aracı
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern UI bileşenleri
- **React Router DOM** - Sayfa yönlendirme
- **React Hook Form** - Form yönetimi
- **Zod** - Şema doğrulama
- **Tanstack Query** - Veri yönetimi
- **Lucide React** - İkonlar
- **Sonner** - Toast bildirimleri
- **Recharts** - Grafik ve çizelgeler

### Backend & Veritabanı
- **Supabase** - Backend-as-a-Service
  - PostgreSQL veritabanı
  - Gerçek zamanlı abonelikler
  - Kimlik doğrulama
  - Dosya depolama
  - Row Level Security (RLS)

### PWA Özellikleri
- Progressive Web App desteği
- Offline çalışma yeteneği
- Mobil uygulama benzeri deneyim

## 📁 Proje Yapısı

```
kumlu2-master/
├── public/                 # Statik dosyalar
│   ├── manifest.json      # PWA manifest
│   ├── pwa-*.png         # PWA ikonları
│   └── sw.js             # Service Worker
├── src/
│   ├── components/       # Yeniden kullanılabilir bileşenler
│   ├── contexts/         # React Context'leri
│   ├── hooks/           # Özel React Hook'ları
│   ├── pages/           # Sayfa bileşenleri
│   ├── lib/             # Yardımcı kütüphaneler
│   ├── integrations/    # Dış entegrasyonlar (Supabase)
│   └── assets/          # Görseller ve diğer varlıklar
├── supabase/
│   ├── migrations/      # Veritabanı migration dosyaları
│   ├── functions/       # Edge Functions
│   └── config.toml      # Supabase yapılandırması
└── *.sql               # Veritabanı script dosyaları
```

## 🛠️ Kurulum ve Çalıştırma

### Gereksinimler
- Node.js (v18 veya üzeri)
- npm veya yarn
- Supabase hesabı

### Adım 1: Projeyi Klonlayın
```bash
git clone <PROJE_GIT_URL>
cd kumlu2-master
```

### Adım 2: Bağımlılıkları Yükleyin
```bash
npm install
```

### Adım 3: Ortam Değişkenlerini Ayarlayın
`.env` dosyasını oluşturun ve aşağıdaki değişkenleri ekleyin:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Adım 4: Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

## 📊 Veritabanı Yapısı

### Ana Tablolar
- **profiles** - Kullanıcı profilleri
- **ayarlar** - Uygulama ayarları
- **kategoriler** - Ürün kategorileri
- **kampanyalar** - Pazarlama kampanyaları
- **servis_bedelleri** - Hizmet ücretleri
- **video_galeri** - Video içerikleri
- **fotograflar** - Görsel galeri
- **hesaplama_urunleri** - Hesaplama ürünleri
- **hesaplama_fiyatlar** - Fiyat hesaplamaları
- **ek_ozellikler** - Ek özellikler
- **marka_logolari** - Marka logoları
- **user_roles** - Kullanıcı rolleri

### Güvenlik
- Row Level Security (RLS) politikaları aktif
- Anonim kullanıcılar için okuma izinleri
- Kimlik doğrulamalı kullanıcılar için tam erişim

## 🔧 Geliştirme Komutları

```bash
# Geliştirme sunucusunu başlat
npm run dev

# Projeyi build et
npm run build

# Build edilen projeyi önizle
npm run start

# Tip kontrolü yap
npm run type-check

# Kod kalitesi kontrolü
npm run lint
```

## 🚀 Deployment

### Vercel ile Deployment
Proje Vercel için optimize edilmiştir:

1. Vercel hesabınıza giriş yapın
2. Projeyi import edin
3. Ortam değişkenlerini ayarlayın
4. Deploy edin

### Supabase Migration'ları
Veritabanı değişikliklerini uygulamak için:

```bash
# Migration dosyalarını çalıştır
supabase db push

# Yerel geliştirme için
supabase start
```

## 🔐 Güvenlik Özellikleri

- **RLS Politikaları**: Tüm tablolarda satır seviyesi güvenlik
- **API Anahtarı Güvenliği**: Anon key ile sınırlı erişim
- **CORS Yapılandırması**: Güvenli cross-origin istekleri
- **Input Validation**: Zod ile şema doğrulama

## 📱 PWA Özellikleri

- **Offline Çalışma**: Service Worker ile cache yönetimi
- **Yüklenebilir**: Ana ekrana ekleme desteği
- **Responsive**: Tüm cihazlarda uyumlu
- **Fast Loading**: Vite ile optimize edilmiş yükleme

## 🐛 Hata Ayıklama

### Yaygın Sorunlar

1. **401 Unauthorized Hatası**
   - Supabase RLS politikalarını kontrol edin
   - API anahtarlarının doğruluğunu kontrol edin

2. **PWA İkon Hatası**
   - `public/pwa-*.png` dosyalarının varlığını kontrol edin
   - Manifest.json dosyasındaki yolları kontrol edin

3. **Build Hataları**
   - TypeScript hatalarını kontrol edin: `npm run type-check`
   - Lint hatalarını düzeltin: `npm run lint`

## 📝 Katkıda Bulunma

1. Projeyi fork edin
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add amazing feature'`)
4. Branch'inizi push edin (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📄 Lisans

Bu proje özel bir projedir. Tüm hakları saklıdır.

## 📞 İletişim

Proje ile ilgili sorularınız için:
- GitHub Issues kullanın
- Proje sahibi ile iletişime geçin

## 🔄 Versiyon Geçmişi

- **v1.0.0** - İlk stabil sürüm
  - Temel CRUD işlemleri
  - Supabase entegrasyonu
  - PWA desteği
  - RLS güvenlik politikaları

---

**Not**: Bu proje aktif olarak geliştirilmektedir. Güncellemeler için düzenli olarak kontrol edin.

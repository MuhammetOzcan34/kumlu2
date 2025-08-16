# Kumlu Folyo Projesi

## 📋 Proje Açıklaması

Kumlu Folyo, modern web teknolojileri kullanılarak geliştirilmiş kapsamlı bir işletme web sitesidir. Proje, folyo kaplama, araç giydirme, tabela üretimi ve kumlamalara yönelik hizmetleri tanıtan, müşteri etkileşimini artıran ve işletme yönetimini kolaylaştıran özellikler sunar.

### 🎯 Temel Özellikler

- **Responsive Tasarım**: Mobil ve masaüstü cihazlarda mükemmel görünüm
- **Admin Paneli**: Kapsamlı içerik yönetim sistemi
- **Fotoğraf Galerisi**: Filigran desteği ile profesyonel görsel yönetimi
- **Video Galeri**: YouTube entegrasyonu ile video içerik yönetimi
- **Instagram Entegrasyonu**: Otomatik sosyal medya içerik çekimi
- **WhatsApp Widget**: Müşteri iletişimini kolaylaştıran anlık mesajlaşma
- **Marka Logoları Popup**: Referans firmaları gösterimi
- **Hesaplama Araçları**: Hizmet bedeli hesaplama modülleri
- **İletişim Formu**: Müşteri talep yönetimi
- **PWA Desteği**: Mobil uygulama deneyimi
- **Dark/Light Mode**: Kullanıcı tercihine göre tema değiştirme

## 🛠️ Teknoloji Stack'i

### Frontend
- **React 18.3.1** - Modern UI kütüphanesi
- **TypeScript** - Tip güvenli geliştirme
- **Vite** - Hızlı geliştirme ve build aracı
- **React Router DOM 6.24.1** - SPA routing (v7 future flags aktif)
- **Tailwind CSS** - Utility-first CSS framework
- **Radix UI** - Erişilebilir UI bileşenleri
- **Lucide React** - Modern ikon kütüphanesi
- **React Query (TanStack)** - Server state yönetimi
- **React Hook Form** - Form yönetimi
- **Zod** - Schema validation
- **Sonner** - Toast bildirimleri
- **Recharts** - Grafik ve chart bileşenleri

### Backend & Database
- **Supabase** - Backend-as-a-Service
  - PostgreSQL veritabanı
  - Real-time subscriptions
  - Authentication
  - File storage
  - Row Level Security (RLS)

### Development Tools
- **ESLint** - Kod kalitesi kontrolü
- **TypeScript ESLint** - TypeScript linting
- **Autoprefixer** - CSS vendor prefix
- **PostCSS** - CSS işleme

## 🚀 Kurulum Talimatları

### Gereksinimler
- Node.js 18+ 
- npm veya pnpm
- Supabase hesabı

### 1. Projeyi Klonlayın
```bash
git clone [repository-url]
cd kumlu2-master
```

### 2. Bağımlılıkları Yükleyin
```bash
npm install
# veya
pnpm install
```

### 3. Ortam Değişkenlerini Ayarlayın
`.env.local` dosyası oluşturun:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Veritabanını Kurun
Supabase projenizi oluşturduktan sonra, `supabase/migrations` klasöründeki SQL dosyalarını sırayla çalıştırın.

### 5. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
```

### 6. Projeyi Build Edin
```bash
npm run build
```

## 🗄️ Veritabanı Yapısı

### Ana Tablolar

#### `ayarlar` Tablosu
- Sistem ayarlarını saklar (anahtar-değer çiftleri)
- Şirket bilgileri, sosyal medya linkleri, tema ayarları
- Watermark, WhatsApp, Instagram ayarları

#### `kategoriler` Tablosu
- Hizmet kategorilerini yönetir
- Fotoğraf galerisi kategorilendirmesi

#### `fotograflar` Tablosu
- Fotoğraf galerisi verilerini saklar
- Kategori ilişkilendirmesi
- Filigran ve metadata bilgileri

#### `videos` Tablosu
- Video galeri içeriklerini yönetir
- YouTube video ID'leri ve metadata

#### `hesaplama_urunleri` Tablosu
- Hesaplama araçları için ürün bilgileri
- Fiyat hesaplama parametreleri

#### `servis_bedelleri` Tablosu
- Hizmet fiyatlandırma bilgileri
- Dinamik fiyat yönetimi

### Storage Buckets
- `fotograflar` - Fotoğraf dosyaları
- `watermark` - Filigran logo dosyaları
- `pwa-icons` - PWA ikon dosyaları

## 📁 Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── ui/             # Temel UI bileşenleri (Radix UI)
│   ├── AdminSidebar.tsx
│   ├── PhotoGalleryManager.tsx
│   ├── WatermarkSettingsManager.tsx
│   └── ...
├── pages/              # Sayfa bileşenleri
│   ├── Index.tsx       # Ana sayfa
│   ├── Admin.tsx       # Admin paneli
│   ├── Iletisim.tsx    # İletişim sayfası
│   └── ...
├── hooks/              # Custom React hooks
│   ├── useSettings.ts  # Ayarlar yönetimi
│   ├── usePhotos.ts    # Fotoğraf işlemleri
│   └── ...
├── contexts/           # React Context providers
│   └── SettingsContext.tsx
├── integrations/       # Dış servis entegrasyonları
│   └── supabase/       # Supabase client ve utilities
├── lib/                # Yardımcı kütüphaneler
│   ├── utils.ts        # Genel utility fonksiyonları
│   └── watermark.ts    # Filigran işleme mantığı
├── utils/              # Utility fonksiyonları
└── assets/             # Statik dosyalar

supabase/
├── migrations/         # Veritabanı migration dosyaları
└── config.toml         # Supabase yapılandırması
```

## 🔄 Son Güncellemeler

### React Router v7 Future Flags ✅
- `v7_startTransition` flag'i etkinleştirildi
- `v7_relativeSplatPath` flag'i etkinleştirildi
- React Router v7 uyumluluğu sağlandı

### Watermark (Filigran) Sistemi ✅
- Gelişmiş filigran ayarları eklendi
- Pattern ve pozisyon tabanlı filigran desteği
- Opaklık, boyut ve açı kontrolü
- Supabase Storage entegrasyonu
- Admin panelinden filigran yönetimi

### Yeni Özellikler
- Marka logoları popup sistemi
- Instagram feed entegrasyonu
- PWA ikon yönetimi
- Video galeri sistemi
- Hesaplama araçları modülü

## 🚀 Deployment

### Vercel Deployment
1. Vercel hesabınıza projeyi bağlayın
2. Ortam değişkenlerini Vercel dashboard'dan ayarlayın
3. Otomatik deployment aktif olacaktır

### Manuel Deployment
```bash
npm run build
# dist/ klasörünü web sunucunuza yükleyin
```

### Ortam Değişkenleri (Production)
```env
VITE_SUPABASE_URL=your_production_supabase_url
VITE_SUPABASE_ANON_KEY=your_production_supabase_anon_key
```

## 👨‍💻 Geliştirici Notları

### Kod Kalitesi
```bash
# Tip kontrolü
npm run type-check

# Linting
npm run lint

# Geliştirme sunucusu
npm run dev
```

### Önemli Dosyalar
- `src/App.tsx` - Ana uygulama bileşeni ve routing
- `src/integrations/supabase/client.ts` - Supabase client yapılandırması
- `src/contexts/SettingsContext.tsx` - Global ayarlar yönetimi
- `src/lib/watermark.ts` - Filigran işleme mantığı

### Geliştirme İpuçları
1. **Bileşen Geliştirme**: Yeni bileşenler `src/components/` altında oluşturun
2. **Sayfa Ekleme**: Yeni sayfalar `src/pages/` altında oluşturun ve `App.tsx`'e route ekleyin
3. **Veritabanı Değişiklikleri**: `supabase/migrations/` altında yeni migration dosyaları oluşturun
4. **Stil Değişiklikleri**: Tailwind CSS utility sınıflarını kullanın
5. **State Yönetimi**: Basit state için React hooks, karmaşık state için React Query kullanın

### Güvenlik Notları
- RLS (Row Level Security) politikaları aktif
- Admin işlemleri için authentication gerekli
- File upload güvenlik kontrolleri mevcut
- CORS ayarları yapılandırılmış

### Performans Optimizasyonları
- Lazy loading ile sayfa bileşenleri
- Image optimization ve lazy loading
- React Query ile cache yönetimi
- Bundle size optimizasyonu

---

**Proje Durumu**: Aktif Geliştirme 🚧  
**Son Güncelleme**: Ocak 2025  
**Versiyon**: 1.0.0  

Herhangi bir sorun veya öneriniz için lütfen issue açın veya iletişime geçin.
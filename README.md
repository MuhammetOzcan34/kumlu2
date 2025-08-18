# Kumlu Folyo - Araç Giydirme ve Folyo Hizmetleri

## 📋 Proje Hakkında

Kumlu Folyo, araç giydirme, folyo kaplama, tabela üretimi ve reklam hizmetleri sunan modern bir web uygulamasıdır. React, TypeScript, Tailwind CSS ve Supabase teknolojileri kullanılarak geliştirilmiştir.

## 🚀 Özellikler

### 🎨 Ana Özellikler
- **Araç Giydirme Galerisi**: Çeşitli araç giydirme örnekleri
- **Folyo Çeşitleri**: Farklı folyo türleri ve uygulamaları
- **Tabela Hizmetleri**: Özel tabela tasarım ve üretimi
- **Kumlamalar**: Cam kumlama hizmetleri
- **Referans Galerisi**: Tamamlanmış projeler
- **Video Galeri**: Hizmet süreçleri ve sonuçları
- **Hesaplama Aracı**: Otomatik fiyat hesaplama sistemi
- **İletişim Formu**: Müşteri talep yönetimi

### 🔧 Admin Panel
- **Fotoğraf Yönetimi**: Galeri fotoğraflarını ekleme, düzenleme, silme
- **Kategori Yönetimi**: Hizmet kategorilerini organize etme
- **Ayarlar Yönetimi**: Site ayarlarını güncelleme
- **Kullanıcı Yönetimi**: Admin yetkilerini kontrol etme
- **Hesaplama Ürünleri**: Fiyat hesaplama parametrelerini yönetme
- **Servis Bedelleri**: Hizmet fiyatlarını güncelleme

### 📱 Teknik Özellikler
- **Responsive Tasarım**: Tüm cihazlarda uyumlu
- **PWA Desteği**: Mobil uygulama deneyimi
- **SEO Optimizasyonu**: Arama motoru dostu
- **Gerçek Zamanlı Güncellemeler**: Supabase ile canlı veri
- **Güvenli Authentication**: JWT tabanlı kimlik doğrulama
- **RLS (Row Level Security)**: Veri güvenliği
- **Image Optimization**: Otomatik görsel optimizasyonu

## 🛠️ Teknolojiler

### Frontend
- **React 18**: Modern UI kütüphanesi
- **TypeScript**: Tip güvenli geliştirme
- **Vite**: Hızlı build aracı
- **Tailwind CSS**: Utility-first CSS framework
- **React Router**: SPA routing
- **React Query**: Server state yönetimi
- **Zustand**: Client state yönetimi
- **Framer Motion**: Animasyonlar
- **Lucide React**: İkon kütüphanesi
- **React Hook Form**: Form yönetimi
- **Sonner**: Toast bildirimleri

### Backend & Database
- **Supabase**: Backend-as-a-Service
- **PostgreSQL**: İlişkisel veritabanı
- **Supabase Auth**: Kimlik doğrulama
- **Supabase Storage**: Dosya depolama
- **Row Level Security**: Veri güvenliği

### DevOps & Tools
- **ESLint**: Kod kalitesi
- **Prettier**: Kod formatı
- **Husky**: Git hooks
- **Vercel**: Deployment platform

## 📦 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya pnpm
- Supabase hesabı

### 1. Projeyi Klonlayın
```bash
git clone <repository-url>
cd kumlu2-master-15.08
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

### 4. Supabase Kurulumu

#### Veritabanı Tabloları
Aşağıdaki tabloları oluşturun:

```sql
-- Kategoriler tablosu
CREATE TABLE kategoriler (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ad TEXT NOT NULL,
  aciklama TEXT,
  tip TEXT NOT NULL,
  aktif BOOLEAN DEFAULT true,
  sira_no INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Fotoğraflar tablosu
CREATE TABLE fotograflar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  dosya_yolu TEXT NOT NULL,
  baslik TEXT,
  aciklama TEXT,
  kategori_id UUID REFERENCES kategoriler(id),
  gorsel_tipi TEXT,
  kullanim_alani TEXT[],
  aktif BOOLEAN DEFAULT true,
  sira_no INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Ayarlar tablosu
CREATE TABLE ayarlar (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  anahtar TEXT UNIQUE NOT NULL,
  deger TEXT,
  aciklama TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Profiller tablosu
CREATE TABLE profiles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT,
  full_name TEXT,
  role TEXT DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### RLS Politikaları
```sql
-- Migration dosyasını çalıştırın
-- supabase/migrations/20250118_full_admin_repair.sql
```

### 5. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
# veya
pnpm dev
```

Uygulama `http://localhost:5173` adresinde çalışacaktır.

## 🏗️ Proje Yapısı

```
src/
├── components/          # React bileşenleri
│   ├── ui/             # Temel UI bileşenleri
│   ├── admin/          # Admin panel bileşenleri
│   └── layout/         # Layout bileşenleri
├── contexts/           # React Context'ler
├── hooks/              # Custom React Hook'ları
├── pages/              # Sayfa bileşenleri
├── utils/              # Yardımcı fonksiyonlar
├── types/              # TypeScript tip tanımları
└── lib/                # Kütüphane konfigürasyonları

supabase/
├── migrations/         # Veritabanı migration'ları
└── config.toml         # Supabase konfigürasyonu

public/
├── icons/              # PWA ikonları
└── images/             # Statik görseller
```

## 🔧 Geliştirme

### Kod Kalitesi Kontrolleri
```bash
# TypeScript kontrolü
npm run type-check

# ESLint kontrolü
npm run lint

# Build testi
npm run build
```

### Yeni Özellik Ekleme
1. İlgili bileşeni `src/components/` altında oluşturun
2. Gerekirse custom hook ekleyin `src/hooks/` altına
3. Supabase tablosu gerekiyorsa migration oluşturun
4. RLS politikalarını güncelleyin
5. TypeScript tiplerini tanımlayın

### Veritabanı Migration'ları
```bash
# Yeni migration oluştur
supabase migration new migration_name

# Migration'ı uygula
supabase db push
```

## 🚀 Deployment

### Vercel ile Deployment
1. Vercel hesabınıza bağlayın
2. Ortam değişkenlerini ayarlayın
3. Otomatik deployment aktif olacaktır

### Manuel Build
```bash
npm run build
```

Build dosyaları `dist/` klasöründe oluşturulur.

## 🔐 Güvenlik

### Authentication
- Supabase Auth ile JWT tabanlı kimlik doğrulama
- Admin rolleri için özel yetkilendirme
- Güvenli session yönetimi

### Row Level Security (RLS)
- Tüm tablolarda RLS aktif
- Kullanıcı bazlı veri erişim kontrolü
- Admin yetkilerinin ayrı politikalarla yönetimi

### Veri Güvenliği
- SQL injection koruması
- XSS koruması
- CSRF koruması
- Güvenli dosya yükleme

## 📊 Performans

### Optimizasyonlar
- Code splitting ile lazy loading
- Image optimization
- React Query ile akıllı caching
- Bundle size optimization
- Tree shaking

### Monitoring
- Error boundary'ler
- Performance monitoring
- User analytics

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request oluşturun

## 📝 Lisans

Bu proje özel lisans altındadır. Kullanım için izin gereklidir.

## 📞 İletişim

- **Web**: [kumlufolyo.com](https://kumlufolyo.com)
- **Email**: info@kumlufolyo.com
- **Telefon**: +90 XXX XXX XX XX

## 🔄 Güncellemeler

### v2.0.0 (2025-01-18)
- ✅ Supabase RLS politikaları düzeltildi
- ✅ Authentication döngü sorunu çözüldü
- ✅ Form yapıları optimize edildi
- ✅ CRUD işlemleri iyileştirildi
- ✅ Admin panel testleri tamamlandı
- ✅ TypeScript ve ESLint uyarıları giderildi

---

**Geliştirici**: SOLO Coding AI Assistant  
**Son Güncelleme**: 18 Ocak 2025
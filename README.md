# Kumlu2 - Kumlama ve Araç Giydirme Hizmetleri Web Uygulaması

## 📋 Proje Hakkında

Kumlu2, kumlama ve araç giydirme hizmetleri sunan bir işletme için geliştirilmiş modern web uygulamasıdır. Uygulama, müşterilere hizmet portföyünü tanıtmak, fiyat hesaplaması yapmak ve iletişim kurmak için kapsamlı bir platform sunar.

## 🚀 Özellikler

### 🎯 Ana Özellikler
- **Hizmet Portföyü**: Kumlama ve araç giydirme hizmetlerinin detaylı tanıtımı
- **Fiyat Hesaplayıcı**: Interaktif hesaplama aracı ile anlık fiyat teklifi
- **Galeri Sistemi**: Foto ve video galerisi ile referans çalışmalar
- **İletişim Modülleri**: WhatsApp, telefon ve e-posta entegrasyonu
- **Admin Paneli**: İçerik yönetimi ve sistem ayarları
- **Responsive Tasarım**: Tüm cihazlarda uyumlu kullanıcı deneyimi

### 🔐 Güvenlik ve Yetkilendirme
- **Supabase Auth**: Güvenli kullanıcı kimlik doğrulama
- **Row Level Security (RLS)**: Veri güvenliği politikaları
- **Rol Tabanlı Erişim**: Admin, kullanıcı ve moderatör rolleri
- **JWT Token**: Güvenli oturum yönetimi

## 🛠️ Teknoloji Stack

### Frontend
- **React 18** - Modern UI kütüphanesi
- **TypeScript** - Tip güvenliği
- **Vite** - Hızlı geliştirme ortamı
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - SPA routing
- **React Query** - Server state yönetimi
- **Zustand** - Client state yönetimi

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - İlişkisel veritabanı
- **Row Level Security** - Veri güvenliği
- **Real-time subscriptions** - Canlı veri güncellemeleri

### UI Components
- **Shadcn/ui** - Modern UI bileşenleri
- **Lucide React** - İkon kütüphanesi
- **Sonner** - Toast bildirimleri
- **Recharts** - Grafik ve chart bileşenleri

## 📁 Proje Yapısı

```
kumlu2/
├── src/
│   ├── components/          # Yeniden kullanılabilir bileşenler
│   │   ├── ui/             # Temel UI bileşenleri
│   │   ├── layout/         # Layout bileşenleri
│   │   └── forms/          # Form bileşenleri
│   ├── pages/              # Sayfa bileşenleri
│   │   ├── Index.tsx       # Ana sayfa
│   │   ├── Admin.tsx       # Admin paneli
│   │   ├── Auth.tsx        # Giriş/Kayıt
│   │   └── ...
│   ├── hooks/              # Custom React hooks
│   ├── contexts/           # React context'leri
│   ├── integrations/       # Dış servis entegrasyonları
│   │   └── supabase/       # Supabase konfigürasyonu
│   ├── utils/              # Yardımcı fonksiyonlar
│   └── types/              # TypeScript tip tanımları
├── supabase/
│   ├── migrations/         # Veritabanı migration dosyaları
│   └── config.toml         # Supabase konfigürasyonu
├── public/                 # Statik dosyalar
└── dist/                   # Build çıktıları
```

## 🗄️ Veritabanı Yapısı

### Ana Tablolar
- **profiles** - Kullanıcı profilleri
- **kategoriler** - Hizmet kategorileri
- **fotograflar** - Galeri fotoğrafları
- **video_galeri** - Video içerikleri
- **kampanyalar** - Kampanya bilgileri
- **servis_bedelleri** - Hizmet fiyatları
- **hesaplama_urunleri** - Hesaplama ürünleri
- **hesaplama_fiyatlar** - Hesaplama fiyat tablosu
- **sayfa_icerikleri** - Dinamik sayfa içerikleri
- **ayarlar** - Sistem ayarları
- **kullanici_rolleri** - Kullanıcı rol yönetimi

### Güvenlik Politikaları
- Kullanıcılar sadece kendi verilerini görebilir/düzenleyebilir
- Admin kullanıcılar tüm verilere erişebilir
- Anonim kullanıcılar sadece genel içerikleri görebilir

## 🚀 Kurulum ve Çalıştırma

### Gereksinimler
- Node.js 18+
- npm veya pnpm
- Supabase hesabı

### Kurulum Adımları

1. **Projeyi klonlayın**
```bash
git clone [repository-url]
cd kumlu2
```

2. **Bağımlılıkları yükleyin**
```bash
npm install
```

3. **Ortam değişkenlerini ayarlayın**
```bash
cp .env.example .env.local
```

4. **Supabase konfigürasyonu**
- Supabase projenizi oluşturun
- `.env.local` dosyasına API anahtarlarını ekleyin:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

5. **Veritabanı migration'larını çalıştırın**
```bash
supabase db push
```

6. **Geliştirme sunucusunu başlatın**
```bash
npm run dev
```

## 📝 Kullanılabilir Komutlar

```bash
# Geliştirme sunucusu
npm run dev

# Production build
npm run build

# Build önizleme
npm start

# TypeScript kontrolü
npm run type-check

# Kod kalitesi kontrolü
npm run lint
```

## 🔧 Konfigürasyon

### Supabase Ayarları
- **Authentication**: Email/password ile giriş
- **Row Level Security**: Tüm tablolarda aktif
- **Real-time**: Kritik tablolarda canlı güncellemeler

### Vercel Deployment
- `vercel.json` dosyası ile otomatik deployment
- API route'ları için rewrites konfigürasyonu
- Environment variables otomatik yönetimi

## 👥 Kullanıcı Rolleri

### Admin
- Tüm içerikleri yönetebilir
- Kullanıcı rollerini düzenleyebilir
- Sistem ayarlarına erişebilir
- Analytics ve raporları görebilir

### Kullanıcı
- Kendi profilini yönetebilir
- Hesaplama araçlarını kullanabilir
- İletişim formlarını gönderebilir

### Anonim
- Genel içerikleri görüntüleyebilir
- Hesaplama araçlarını kullanabilir
- İletişim bilgilerine erişebilir

## 🔒 Güvenlik

- **HTTPS**: Tüm iletişim şifreli
- **JWT Tokens**: Güvenli oturum yönetimi
- **RLS Policies**: Veri seviyesinde güvenlik
- **Input Validation**: Tüm kullanıcı girdileri doğrulanır
- **XSS Protection**: Cross-site scripting koruması

## 📱 Responsive Tasarım

- **Mobile First**: Önce mobil tasarım yaklaşımı
- **Breakpoints**: Tailwind CSS breakpoint'leri
- **Touch Friendly**: Dokunmatik cihazlar için optimize
- **Performance**: Hızlı yükleme süreleri

## 🚀 Deployment

### Vercel (Önerilen)
1. Vercel hesabınıza bağlayın
2. Environment variables'ları ayarlayın
3. Otomatik deployment aktif

### Manuel Deployment
1. `npm run build` ile build alın
2. `dist/` klasörünü sunucuya yükleyin
3. Environment variables'ları ayarlayın

## 🐛 Hata Ayıklama

### Yaygın Sorunlar

1. **Supabase Bağlantı Hatası**
   - API anahtarlarını kontrol edin
   - URL'nin doğru olduğundan emin olun

2. **RLS Policy Hatası**
   - Kullanıcı rollerini kontrol edin
   - Policy'lerin doğru tanımlandığından emin olun

3. **Build Hatası**
   - TypeScript hatalarını düzeltin
   - Bağımlılıkları güncelleyin

## 📞 İletişim ve Destek

- **E-posta**: [destek-email]
- **Telefon**: [telefon-numarası]
- **WhatsApp**: [whatsapp-numarası]

## 📄 Lisans

Bu proje [Lisans Türü] lisansı altında lisanslanmıştır.

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/AmazingFeature`)
3. Değişikliklerinizi commit edin (`git commit -m 'Add some AmazingFeature'`)
4. Branch'inizi push edin (`git push origin feature/AmazingFeature`)
5. Pull Request oluşturun

## 📈 Performans

- **Lighthouse Score**: 90+
- **First Contentful Paint**: <2s
- **Largest Contentful Paint**: <3s
- **Cumulative Layout Shift**: <0.1

---

**Son Güncelleme**: Ağustos 2024
**Versiyon**: 1.0.0
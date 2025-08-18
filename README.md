# Kumlu Folyo - Modern Web Uygulaması

## 📋 Proje Hakkında

Kumlu Folyo, modern React teknolojileri kullanılarak geliştirilmiş kapsamlı bir web uygulamasıdır. Supabase backend altyapısı ile güçlendirilmiş bu uygulama, fotoğraf galerisi yönetimi, kategori sistemi, kullanıcı kimlik doğrulaması ve admin paneli gibi özellikler sunar.

## 🚀 Teknoloji Stack

### Frontend
- **React 18** - Modern UI kütüphanesi
- **TypeScript** - Tip güvenliği
- **Vite** - Hızlı geliştirme ortamı
- **Tailwind CSS** - Utility-first CSS framework
- **React Router** - Client-side routing
- **Zustand** - State management
- **React Query** - Server state management
- **Lucide React** - İkon kütüphanesi
- **Sonner** - Toast bildirimleri
- **React Hook Form** - Form yönetimi

### Backend & Database
- **Supabase** - Backend-as-a-Service
- **PostgreSQL** - Veritabanı
- **Row Level Security (RLS)** - Güvenlik
- **Storage** - Dosya yönetimi
- **Authentication** - Kimlik doğrulama

## 📁 Proje Yapısı

```
kumlu2-master-15.08/
├── src/
│   ├── components/          # React bileşenleri
│   │   ├── admin/          # Admin panel bileşenleri
│   │   ├── ui/             # UI bileşenleri (shadcn/ui)
│   │   └── ...             # Diğer bileşenler
│   ├── contexts/           # React Context'leri
│   ├── hooks/              # Custom React Hook'ları
│   ├── pages/              # Sayfa bileşenleri
│   ├── utils/              # Yardımcı fonksiyonlar
│   └── lib/                # Kütüphane konfigürasyonları
├── supabase/
│   └── migrations/         # Veritabanı migration dosyaları
├── public/                 # Statik dosyalar
└── dist/                   # Build çıktıları
```

## 🗄️ Veritabanı Şeması

### Tablolar

#### `kategoriler`
- `id` (UUID, Primary Key)
- `ad` (Text) - Kategori adı
- `slug` (Text, Unique) - URL dostu ad
- `aciklama` (Text) - Kategori açıklaması
- `created_at` (Timestamp)

#### `fotograflar`
- `id` (UUID, Primary Key)
- `baslik` (Text) - Fotoğraf başlığı
- `dosya_yolu` (Text, Unique) - Storage'daki dosya yolu
- `kategori_id` (UUID, Foreign Key) - Kategori referansı
- `kullanim_alani` (Text) - Kullanım alanı
- `gorsel_tipi` (Text) - Görsel tipi
- `created_at` (Timestamp)

#### `ayarlar`
- `id` (UUID, Primary Key)
- `anahtar` (Text, Unique) - Ayar anahtarı
- `deger` (Text) - Ayar değeri
- `created_at` (Timestamp)

#### `kullanici_rolleri`
- `id` (UUID, Primary Key)
- `kullanici_id` (UUID) - Kullanıcı ID'si
- `rol` (Text) - Kullanıcı rolü (admin/user)
- `created_at` (Timestamp)

### Storage Buckets
- `fotograflar` - Fotoğraf dosyaları
- `images` - Genel resim dosyaları
- `watermark` - Filigran dosyaları
- `public` - Genel erişilebilir dosyalar

## 🔐 Güvenlik

### Row Level Security (RLS)
Tüm tablolarda RLS etkinleştirilmiştir:
- **Okuma**: Herkese açık
- **Yazma/Güncelleme/Silme**: Sadece admin kullanıcılar

### Authentication
- JWT token tabanlı kimlik doğrulama
- Otomatik token yenileme
- Role-based access control

## 🛠️ Kurulum

### Gereksinimler
- Node.js 18+
- npm veya pnpm
- Supabase hesabı

### Adımlar

1. **Projeyi klonlayın**
```bash
git clone <repository-url>
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

4. **Supabase migration'larını çalıştırın**
```bash
supabase db push
```

5. **Geliştirme sunucusunu başlatın**
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

# TypeScript tip kontrolü
npm run type-check

# ESLint kod kalitesi kontrolü
npm run lint
```

## 🔧 Admin Panel

### Özellikler
- **Fotoğraf Yönetimi**: Fotoğraf yükleme, düzenleme, silme
- **Kategori Yönetimi**: Kategori oluşturma, düzenleme, silme
- **Ayar Yönetimi**: Site ayarlarını güncelleme
- **Kullanıcı Yönetimi**: Kullanıcı rollerini yönetme

### Erişim
1. `/auth` sayfasından giriş yapın
2. Admin yetkisi olan hesapla giriş yapın
3. `/admin` sayfasına yönlendirileceksiniz

## 🎨 UI/UX Özellikleri

- **Responsive Design**: Tüm cihazlarda uyumlu
- **Dark/Light Mode**: Tema desteği
- **Modern Animasyonlar**: Smooth geçişler
- **Accessibility**: WCAG uyumlu
- **PWA Ready**: Progressive Web App desteği

## 📱 Bileşenler

### Ana Bileşenler
- `Admin.tsx` - Admin panel ana bileşeni
- `Auth.tsx` - Kimlik doğrulama bileşeni
- `ImageSlider.tsx` - Fotoğraf slider'ı
- `HamburgerMenu.tsx` - Mobil menü
- `DesktopSidebar.tsx` - Masaüstü yan menü

### Admin Bileşenleri
- `PhotoUploadManager.tsx` - Fotoğraf yükleme yöneticisi
- `CategoryManager.tsx` - Kategori yöneticisi
- `CompanySettingsManager.tsx` - Şirket ayarları yöneticisi

## 🔄 State Management

### Zustand Store'ları
- Global uygulama durumu
- Kullanıcı oturumu
- UI durumları

### React Query
- Server state yönetimi
- Cache yönetimi
- Otomatik refetch

## 🚨 Hata Yönetimi

- **Global Error Boundary**: Uygulama çapında hata yakalama
- **Toast Notifications**: Kullanıcı dostu hata mesajları
- **Logging**: Konsol ve server-side loglama
- **Fallback UI**: Hata durumunda alternatif arayüz

## 🔍 Debugging

### Geliştirme Araçları
- React Developer Tools
- Redux DevTools (Zustand)
- Network tab (API çağrıları)
- Console logs

### Yaygın Sorunlar
1. **401 Unauthorized**: JWT token kontrolü yapın
2. **RLS Policy**: Supabase policy'lerini kontrol edin
3. **CORS**: Supabase URL'lerini doğrulayın

## 📈 Performans

### Optimizasyonlar
- **Code Splitting**: Route-based lazy loading
- **Image Optimization**: WebP format desteği
- **Bundle Analysis**: Webpack bundle analyzer
- **Caching**: Browser ve CDN cache

## 🧪 Test

### Test Stratejisi
- Unit testler (Jest)
- Integration testler
- E2E testler (Playwright)
- Visual regression testler

## 🚀 Deployment

### Vercel (Önerilen)
```bash
# Vercel CLI ile deploy
npm i -g vercel
vercel
```

### Netlify
```bash
# Build komutu: npm run build
# Publish directory: dist
```

### Docker
```dockerfile
# Dockerfile örneği
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build
EXPOSE 3000
CMD ["npm", "start"]
```

## 🤝 Katkıda Bulunma

1. Fork yapın
2. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
3. Commit yapın (`git commit -m 'Add amazing feature'`)
4. Push yapın (`git push origin feature/amazing-feature`)
5. Pull Request açın

## 📄 Lisans

Bu proje MIT lisansı altında lisanslanmıştır.

## 📞 İletişim

- **Proje Sahibi**: Kumlu Folyo
- **Email**: info@kumlufolyo.com
- **Website**: https://kumlufolyo.com

## 🔄 Changelog

### v1.0.0 (2024-08-18)
- ✅ İlk stabil sürüm
- ✅ Admin panel CRUD işlemleri
- ✅ Supabase entegrasyonu
- ✅ Authentication sistemi
- ✅ Responsive design
- ✅ Performance optimizasyonları

---

**Not**: Bu README dosyası projenin güncel durumunu yansıtmaktadır. Herhangi bir sorun yaşarsanız, lütfen issue açın veya doğrudan iletişime geçin.
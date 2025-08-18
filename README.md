# Kumlu2 - Kumlu Folyo Web Uygulaması

## Proje Hakkında

Kumlu2, modern web teknolojileri kullanılarak geliştirilmiş bir portfolyo ve işletme tanıtım web uygulamasıdır. React, TypeScript, Vite ve Supabase teknolojileri ile geliştirilmiştir.

## 🚀 Teknolojiler

- **Frontend**: React 18, TypeScript, Vite
- **UI Kütüphanesi**: Tailwind CSS, Radix UI, Shadcn/ui
- **Backend**: Supabase (PostgreSQL, Auth, Storage)
- **Routing**: React Router DOM
- **State Management**: React Context API
- **Form Yönetimi**: React Hook Form
- **Bildirimler**: Sonner (Toast)
- **İkonlar**: Lucide React
- **Grafik**: Recharts
- **3D**: Three.js

## 📁 Proje Yapısı

```
kumlu2/
├── public/                 # Statik dosyalar
├── src/
│   ├── components/         # Yeniden kullanılabilir bileşenler
│   │   ├── ui/            # Temel UI bileşenleri (Shadcn/ui)
│   │   └── ...            # Özel bileşenler
│   ├── contexts/          # React Context sağlayıcıları
│   │   ├── AuthContext.tsx    # Kimlik doğrulama yönetimi
│   │   └── SettingsContext.tsx # Uygulama ayarları
│   ├── hooks/             # Özel React hook'ları
│   ├── integrations/      # Dış servis entegrasyonları
│   │   └── supabase/      # Supabase yapılandırması
│   ├── pages/             # Sayfa bileşenleri
│   │   ├── Admin.tsx      # Yönetim paneli
│   │   ├── Auth.tsx       # Giriş/Kayıt sayfası
│   │   └── ...            # Diğer sayfalar
│   ├── utils/             # Yardımcı fonksiyonlar
│   ├── App.tsx            # Ana uygulama bileşeni
│   └── main.tsx           # Uygulama giriş noktası
├── supabase/              # Supabase yapılandırması
│   └── migrations/        # Veritabanı migration dosyaları
├── package.json           # Proje bağımlılıkları
├── vite.config.ts         # Vite yapılandırması
├── tailwind.config.js     # Tailwind CSS yapılandırması
└── tsconfig.json          # TypeScript yapılandırması
```

## 🔧 Kurulum

### Gereksinimler
- Node.js 18+
- npm veya pnpm
- Supabase hesabı

### Adımlar

1. **Projeyi klonlayın**
   ```bash
   git clone <repository-url>
   cd kumlu2
   ```

2. **Bağımlılıkları yükleyin**
   ```bash
   npm install
   ```

3. **Ortam değişkenlerini ayarlayın**
   - `.env.local` dosyası oluşturun
   - Supabase proje bilgilerinizi ekleyin:
   ```env
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Geliştirme sunucusunu başlatın**
   ```bash
   npm run dev
   ```

## 📊 Veritabanı Yapısı

### Ana Tablolar

- **profiles**: Kullanıcı profil bilgileri
- **kategoriler**: İş kategorileri
- **fotograflar**: Portfolyo fotoğrafları
- **ayarlar**: Uygulama ayarları
- **kampanyalar**: Pazarlama kampanyaları

### RLS (Row Level Security) Politikaları

Tüm tablolar için Row Level Security aktif edilmiştir:
- `anon` rolü: Sadece okuma yetkisi
- `authenticated` rolü: Tam yetki
- Admin kullanıcıları: Tüm verilere erişim

## 🔐 Kimlik Doğrulama

### Kullanıcı Rolleri
- **admin**: Tam yönetim yetkisi (admin@kumlu2.com)
- **user**: Standart kullanıcı yetkisi

### Özellikler
- E-posta/şifre ile giriş
- Kullanıcı kaydı
- Otomatik profil oluşturma
- Rol tabanlı yetkilendirme
- Oturum yönetimi

## 🎨 UI Bileşenleri

### Shadcn/ui Bileşenleri
- Button, Input, Label
- Card, Dialog, Sheet
- Table, Tabs, Badge
- Toast (Sonner)
- Form bileşenleri

### Özel Bileşenler
- ProtectedRoute: Korumalı sayfa yönlendirmesi
- AuthContext: Global kimlik doğrulama
- SettingsContext: Uygulama ayarları

## 📱 Sayfalar

### Genel Sayfalar
- **Ana Sayfa**: İşletme tanıtımı
- **Kumlamalar**: Kum işleri portfolyosu
- **Araç Giydirme**: Araç modifikasyon hizmetleri
- **Tabelalar**: Tabela ve reklam hizmetleri
- **Referanslar**: Müşteri referansları
- **Video Galeri**: İş videoları
- **Servis Bedelleri**: Hizmet fiyatları
- **Hesaplama**: Maliyet hesaplayıcı
- **İletişim**: İletişim bilgileri

### Yönetim Sayfaları
- **Auth**: Giriş/Kayıt sayfası
- **Admin**: Yönetim paneli
  - Kampanya yönetimi
  - Kategori yönetimi
  - Fotoğraf yönetimi
  - Ayar yönetimi

### Yasal Sayfalar
- **Gizlilik Politikası**: KVKK uyumlu gizlilik politikası
- **Kullanım Şartları**: Hizmet kullanım koşulları

## 🛠 Geliştirme Komutları

```bash
# Geliştirme sunucusu
npm run dev

# Üretim build'i
npm run build

# TypeScript kontrolü
npm run type-check

# Kod kalitesi kontrolü
npm run lint

# Önizleme sunucusu
npm run start
```

## 🔍 Önemli Dosyalar

### Yapılandırma Dosyaları
- `vite.config.ts`: Vite yapılandırması, path aliasları
- `tailwind.config.js`: Tailwind CSS özelleştirmeleri
- `tsconfig.json`: TypeScript derleyici ayarları
- `postcss.config.js`: PostCSS işlemcisi

### Entegrasyon Dosyaları
- `src/integrations/supabase/client.ts`: Supabase istemci yapılandırması
- `src/contexts/AuthContext.tsx`: Kimlik doğrulama yönetimi
- `src/contexts/SettingsContext.tsx`: Uygulama ayarları

### Yardımcı Dosyalar
- `src/utils/`: Yardımcı fonksiyonlar ve tipler
- `src/hooks/`: Özel React hook'ları

## 🚀 Deployment

### Vercel Deployment
1. Vercel hesabınıza bağlayın
2. Ortam değişkenlerini ayarlayın
3. Otomatik deployment aktif olacak

### Manuel Build
```bash
npm run build
npm run start
```

## 🐛 Sorun Giderme

### Yaygın Sorunlar

1. **"main.tsx yüklenemiyor" hatası**
   - Tarayıcı önbelleğini temizleyin
   - Development server'ı yeniden başlatın

2. **Supabase bağlantı hatası**
   - Ortam değişkenlerini kontrol edin
   - Supabase proje durumunu kontrol edin

3. **TypeScript hataları**
   - `npm run type-check` ile kontrol edin
   - Tip tanımlarını güncelleyin

4. **"Yönlendiriliyor" ekranında kalma**
   - AuthContext'in düzgün çalıştığını kontrol edin
   - Tarayıcı geliştirici araçlarında console hatalarını kontrol edin

## 📝 Lisans

Bu proje özel bir projedir. Tüm hakları saklıdır.

## 👥 Katkıda Bulunma

Bu proje aktif geliştirme aşamasındadır. Katkıda bulunmak için:
1. Fork yapın
2. Feature branch oluşturun
3. Değişikliklerinizi commit edin
4. Pull request gönderin

## 📞 İletişim

Sorularınız için: admin@kumlu2.com

---

**Son Güncelleme**: Ağustos 2024
**Versiyon**: 1.0.0
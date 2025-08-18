# Kumlu Folyo - Araç Giydirme ve Folyo Hizmetleri

## 📋 Proje Hakkında

Kumlu Folyo, araç giydirme, folyo kaplama, tabela üretimi ve reklam hizmetleri sunan modern bir web uygulamasıdır. React, TypeScript, Tailwind CSS ve Supabase teknolojileri kullanılarak geliştirilmiştir.

## 🚀 Özellikler

### 🎨 Ana Özellikler
- **Araç Giydirme Galerisi**: Çeşitli araç giydirme örnekleri ve portföy
- **Folyo Çeşitleri**: Farklı folyo türleri ve uygulamaları
- **Tabela Hizmetleri**: Özel tabela tasarım ve üretimi
- **Kumlamalar**: Cam kumlama hizmetleri ve örnekleri
- **Referans Galerisi**: Tamamlanmış projeler ve müşteri referansları
- **Video Galeri**: Hizmet süreçleri ve sonuçları
- **Hesaplama Aracı**: Otomatik fiyat hesaplama sistemi
- **İletişim Formu**: Müşteri talep yönetimi ve teklif sistemi
- **WhatsApp Entegrasyonu**: Hızlı iletişim widget'ı
- **Instagram Feed**: Sosyal medya entegrasyonu
- **PWA Desteği**: Mobil uygulama deneyimi

### 🔧 Admin Panel
- **Fotoğraf Yönetimi**: Galeri fotoğraflarını ekleme, düzenleme, silme
- **Kategori Yönetimi**: Hizmet kategorilerini organize etme
- **Video Yönetimi**: Video galeri içerik yönetimi
- **Ayarlar Yönetimi**: Site ayarlarını güncelleme
- **Kullanıcı Yönetimi**: Admin yetkilerini kontrol etme
- **Hesaplama Ürünleri**: Fiyat hesaplama parametrelerini yönetme
- **Servis Bedelleri**: Hizmet fiyatlarını güncelleme
- **Kampanya Yönetimi**: Reklam kampanyalarını yönetme
- **Instagram Ayarları**: Sosyal medya entegrasyon ayarları
- **WhatsApp Ayarları**: İletişim widget konfigürasyonu
- **Watermark Ayarları**: Görsel filigran yönetimi
- **PWA İkon Yönetimi**: Uygulama ikonları güncelleme
- **Şirket Bilgileri**: İletişim ve adres bilgileri yönetimi

### 📱 Teknik Özellikler
- **Responsive Tasarım**: Tüm cihazlarda uyumlu
- **PWA Desteği**: Mobil uygulama deneyimi
- **SEO Optimizasyonu**: Arama motoru dostu
- **Gerçek Zamanlı Güncellemeler**: Supabase ile canlı veri
- **Güvenli Authentication**: JWT tabanlı kimlik doğrulama
- **RLS (Row Level Security)**: Veri güvenliği
- **Image Optimization**: Otomatik görsel optimizasyonu
- **Dark/Light Mode**: Tema değiştirme desteği
- **Loading States**: Gelişmiş yükleme durumu yönetimi
- **Error Handling**: Kapsamlı hata yönetimi
- **Toast Notifications**: Kullanıcı bildirimleri

## 🛠️ Teknolojiler

### Frontend
- **React 18.3.1**: Modern UI kütüphanesi
- **TypeScript 5.6.2**: Tip güvenli geliştirme
- **Vite 5.4.10**: Hızlı build aracı
- **Tailwind CSS 3.4.17**: Utility-first CSS framework
- **React Router DOM 6.28.0**: SPA routing
- **TanStack React Query 5.51.1**: Server state yönetimi
- **Zustand 5.0.2**: Client state yönetimi
- **Lucide React 0.468.0**: İkon kütüphanesi
- **React Hook Form 7.54.0**: Form yönetimi
- **Sonner 1.7.0**: Toast bildirimleri
- **Radix UI**: Accessible UI bileşenleri
- **Next Themes 0.3.0**: Tema yönetimi
- **Recharts 2.13.3**: Grafik ve chart bileşenleri

### Backend & Database
- **Supabase 2.46.2**: Backend-as-a-Service
- **PostgreSQL**: İlişkisel veritabanı
- **Supabase Auth**: Kimlik doğrulama
- **Supabase Storage**: Dosya depolama
- **Row Level Security**: Veri güvenliği
- **Real-time Subscriptions**: Canlı veri güncellemeleri

### DevOps & Tools
- **ESLint 9.17.0**: Kod kalitesi
- **TypeScript ESLint 8.18.2**: TypeScript linting
- **Autoprefixer 10.4.20**: CSS vendor prefix
- **PostCSS 8.5.1**: CSS işleme
- **Vercel**: Deployment platform

## 📦 Kurulum

### Gereksinimler
- Node.js 18+ (Önerilen: 22.17.0)
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
`.env` dosyası oluşturun:
```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### 4. Supabase Kurulumu

#### Veritabanı Migration'larını Çalıştırın
```bash
# Supabase CLI kurulumu (gerekirse)
npm install -g @supabase/cli

# Migration'ları uygula
supabase db push
```

#### Ana Tablolar
- **kategoriler**: Hizmet kategorileri
- **fotograflar**: Galeri fotoğrafları
- **videolar**: Video galeri içerikleri
- **ayarlar**: Site ayarları ve konfigürasyonlar
- **profiles**: Kullanıcı profilleri
- **hesaplama_urunleri**: Fiyat hesaplama ürünleri
- **servis_bedelleri**: Hizmet fiyat listesi
- **kampanyalar**: Reklam kampanyaları
- **kullanici_rolleri**: Kullanıcı yetkileri

### 5. Geliştirme Sunucusunu Başlatın
```bash
npm run dev
# veya
pnpm dev
```

Uygulama `http://localhost:8080` adresinde çalışacaktır.

## 🏗️ Detaylı Proje Yapısı

```
kumlu2-master-15.08/
├── 📁 public/                    # Statik dosyalar
│   ├── default-logo.svg          # Varsayılan logo
│   ├── favicon.ico               # Site ikonu
│   ├── manifest.json             # PWA manifest
│   ├── pwa-192x192.png          # PWA ikonu (küçük)
│   ├── pwa-512x512.png          # PWA ikonu (büyük)
│   ├── robots.txt               # SEO robots dosyası
│   └── sw.js                    # Service Worker
│
├── 📁 src/                       # Kaynak kodlar
│   ├── 📁 api/                   # API entegrasyonları
│   │   └── instagram.ts          # Instagram API
│   │
│   ├── 📁 assets/                # Statik varlıklar
│   │   ├── default-logo.svg      # Logo dosyası
│   │   ├── referanslar-original.jpeg
│   │   └── sample-reference-logos.jpg
│   │
│   ├── 📁 components/            # React bileşenleri
│   │   ├── 📁 ui/                # Temel UI bileşenleri
│   │   │   ├── accordion.tsx     # Accordion bileşeni
│   │   │   ├── alert-dialog.tsx  # Alert dialog
│   │   │   ├── avatar.tsx        # Avatar bileşeni
│   │   │   ├── badge.tsx         # Badge/rozet
│   │   │   ├── button.tsx        # Button bileşeni
│   │   │   ├── card.tsx          # Card bileşeni
│   │   │   ├── checkbox.tsx      # Checkbox
│   │   │   ├── dialog.tsx        # Dialog modal
│   │   │   ├── dropdown-menu.tsx # Dropdown menü
│   │   │   ├── form.tsx          # Form bileşenleri
│   │   │   ├── input.tsx         # Input alanları
│   │   │   ├── label.tsx         # Label etiketleri
│   │   │   ├── popover.tsx       # Popover
│   │   │   ├── progress.tsx      # Progress bar
│   │   │   ├── scroll-area.tsx   # Scroll alanı
│   │   │   ├── select.tsx        # Select dropdown
│   │   │   ├── separator.tsx     # Ayırıcı çizgi
│   │   │   ├── sheet.tsx         # Side sheet
│   │   │   ├── switch.tsx        # Toggle switch
│   │   │   ├── tabs.tsx          # Tab bileşeni
│   │   │   ├── textarea.tsx      # Textarea
│   │   │   ├── toast.tsx         # Toast bildirimi
│   │   │   └── tooltip.tsx       # Tooltip
│   │   │
│   │   ├── AdminSidebar.tsx      # Admin yan menü
│   │   ├── BrandLogosPopup.tsx   # Marka logoları popup
│   │   ├── BrandLogosSettingsManager.tsx # Marka logo ayarları
│   │   ├── CategoryManager.tsx   # Kategori yönetimi
│   │   ├── CompanySettingsManager.tsx # Şirket ayarları
│   │   ├── ContactForm.tsx       # İletişim formu
│   │   ├── DesktopSidebar.tsx    # Masaüstü yan menü
│   │   ├── ElfsightInstagramFeed.tsx # Instagram feed
│   │   ├── GoogleMap.tsx         # Google harita
│   │   ├── HamburgerMenu.tsx     # Hamburger menü
│   │   ├── HeroButtons.tsx       # Ana sayfa butonları
│   │   ├── HesaplamaUrunleriManager.tsx # Hesaplama ürünleri
│   │   ├── ImageModal.tsx        # Görsel modal
│   │   ├── ImageSlider.tsx       # Görsel slider
│   │   ├── InstagramFeed.tsx     # Instagram beslemesi
│   │   ├── InstagramSettingsManager.tsx # Instagram ayarları
│   │   ├── KampanyaForm.tsx      # Kampanya formu
│   │   ├── LogoDisplay.tsx       # Logo gösterimi
│   │   ├── MobileNavigation.tsx  # Mobil navigasyon
│   │   ├── PWAIconManager.tsx    # PWA ikon yönetimi
│   │   ├── PhoneButton.tsx       # Telefon butonu
│   │   ├── PhotoGalleryManager.tsx # Fotoğraf galeri yönetimi
│   │   ├── PhotoUploadManager.tsx # Fotoğraf yükleme
│   │   ├── ReferenceLogos.tsx    # Referans logoları
│   │   ├── ScrollToTop.tsx       # Yukarı kaydır
│   │   ├── ServiceCard.tsx       # Hizmet kartı
│   │   ├── ServisBedelleriManager.tsx # Servis bedelleri
│   │   ├── TeklifFormu.tsx       # Teklif formu
│   │   ├── ThemeToggle.tsx       # Tema değiştirici
│   │   ├── VideoGaleriManager.tsx # Video galeri yönetimi
│   │   ├── VideoModal.tsx        # Video modal
│   │   ├── WatermarkSettingsManager.tsx # Filigran ayarları
│   │   ├── WhatsAppSettingsManager.tsx # WhatsApp ayarları
│   │   └── WhatsAppWidget.tsx    # WhatsApp widget
│   │
│   ├── 📁 contexts/              # React Context'ler
│   │   └── SettingsContext.tsx   # Ayarlar context
│   │
│   ├── 📁 hooks/                 # Custom React Hook'ları
│   │   ├── use-mobile.tsx        # Mobil cihaz tespiti
│   │   ├── use-toast.ts          # Toast hook
│   │   ├── useCategories.ts      # Kategori hook
│   │   ├── useHesaplamaUrunleri.ts # Hesaplama ürünleri hook
│   │   ├── usePhonePosition.ts   # Telefon pozisyon hook
│   │   ├── usePhotos.ts          # Fotoğraf hook
│   │   ├── useReferenceLogos.ts  # Referans logo hook
│   │   ├── useServisBedelleri.ts # Servis bedelleri hook
│   │   ├── useSettings.ts        # Ayarlar hook
│   │   └── useVideos.ts          # Video hook
│   │
│   ├── 📁 integrations/          # Dış entegrasyonlar
│   │   └── 📁 supabase/          # Supabase konfigürasyonu
│   │       ├── client.ts         # Supabase client
│   │       └── types.ts          # Supabase tipleri
│   │
│   ├── 📁 lib/                   # Kütüphane dosyaları
│   │   ├── utils.ts              # Yardımcı fonksiyonlar
│   │   └── watermark.ts          # Filigran işlemleri
│   │
│   ├── 📁 pages/                 # Sayfa bileşenleri
│   │   ├── Admin.tsx             # Admin panel
│   │   ├── Admin.tsx.backup      # Admin yedek
│   │   ├── AracGiydirme.tsx      # Araç giydirme sayfası
│   │   ├── Auth.tsx              # Kimlik doğrulama
│   │   ├── GizlilikPolitikasi.tsx # Gizlilik politikası
│   │   ├── Hesaplama.tsx         # Hesaplama sayfası
│   │   ├── Iletisim.tsx          # İletişim sayfası
│   │   ├── Index.tsx             # Ana sayfa
│   │   ├── KullanimSartlari.tsx  # Kullanım şartları
│   │   ├── Kumlamalar.tsx        # Kumlama sayfası
│   │   ├── NotFound.tsx          # 404 sayfası
│   │   ├── Referanslar.tsx       # Referanslar sayfası
│   │   ├── ServisBedelleri.tsx   # Servis bedelleri
│   │   ├── Tabelalar.tsx         # Tabela sayfası
│   │   └── VideoGaleri.tsx       # Video galeri
│   │
│   ├── 📁 utils/                 # Yardımcı fonksiyonlar
│   │   ├── debounce.ts           # Debounce fonksiyonu
│   │   ├── placeholders.ts       # Placeholder veriler
│   │   └── storageUtils.ts       # Depolama yardımcıları
│   │
│   ├── App.css                   # Ana CSS
│   ├── App.tsx                   # Ana uygulama bileşeni
│   ├── index.css                 # Global CSS
│   ├── main.tsx                  # Uygulama giriş noktası
│   └── vite-env.d.ts             # Vite tip tanımları
│
├── 📁 supabase/                  # Supabase konfigürasyonu
│   ├── 📁 .temp/                 # Geçici dosyalar
│   ├── 📁 functions/             # Edge functions
│   │   └── 📁 image-proxy/       # Görsel proxy fonksiyonu
│   ├── 📁 migrations/            # Veritabanı migration'ları
│   │   ├── 20240611120000_alter_ek_ozellikler_add_tutar_birim.sql
│   │   ├── 20250101000000-update-hesaplama-tables.sql
│   │   ├── 20250714232528-b448f19e-0f1d-48e8-92cd-19591fa70fb7.sql
│   │   ├── 20250718175250-39041af8-8396-40b0-aa1e-c9a6455e0ad7.sql
│   │   ├── 20250718175451-794bdfd8-7b6e-4f1b-98e7-fd2d5d43bdab.sql
│   │   ├── 20250720134959-60890d6c-6904-4678-9b4c-7dedffe12d9f.sql
│   │   ├── 20250722115016-c05ee28b-88c3-4aeb-be9c-a16a8eaeeffd.sql
│   │   ├── 20250725005401-c2a38bc4-8ced-4c7a-b3b6-e45d214fea9e.sql
│   │   ├── 20250725011100-bc02e354-1d2b-4688-b98d-e1e1f5847854.sql
│   │   ├── 20250725032639-297b4b88-cdf6-4424-a7a0-9393c4dd6089.sql
│   │   ├── 20250725033303-9f6acb04-d43b-4931-9d3b-d34bc7e862f7.sql
│   │   ├── 20250725041953-230c4491-6a78-4cda-8d6c-a5c42378af2f.sql
│   │   ├── 20250725042018-951bafb0-d2de-4e34-8a15-d96ef43f31e1.sql
│   │   ├── 20250725042044-d86b22d8-ffd7-4b27-9779-b9ef164e2a1f.sql
│   │   ├── 20250725042758-35c83a1c-1fa7-4eaf-bda7-ae93d94f442f.sql
│   │   ├── 20250725043649-4484ae69-aebb-4d1f-b171-8071962c225a.sql
│   │   ├── 20250725051959-e0da1b25-f41f-454f-ad46-80e421a09339.sql
│   │   ├── 20250725052030-a6b89645-493f-4fa0-b327-43b284024edc.sql
│   │   ├── 20250728135929-4938a1b7-5252-40a9-961a-7c1cf25c206c.sql
│   │   ├── 20250728135950-c61f25fd-802a-41fa-8ee0-c6c332cacd4a.sql
│   │   ├── 20250728140230-881af7b0-6d15-49b3-b2d6-470b9b24afd8.sql
│   │   ├── 20250728140417-83346918-409c-417d-8b07-b4834842bd3e.sql
│   │   ├── 20250728140555-97a44ee6-7cba-4aba-b897-64ce0da27d4d.sql
│   │   ├── 20250728141000-instagram-settings.sql
│   │   ├── 20250729000000-add-working-hours.sql
│   │   ├── 20250808043619_fix_storage_bucket.sql
│   │   ├── 20250809090000-fix-profiles-rls-recursion.sql
│   │   └── 20250809090500-fix-settings-rls-nonrecursive.sql
│   └── config.toml               # Supabase konfigürasyonu
│
├── 📁 Konfigürasyon Dosyaları
│   ├── .env                      # Ortam değişkenleri
│   ├── .gitignore                # Git ignore kuralları
│   ├── .vercelignore             # Vercel ignore kuralları
│   ├── components.json           # Shadcn/ui konfigürasyonu
│   ├── eslint.config.js          # ESLint konfigürasyonu
│   ├── index.html                # Ana HTML dosyası
│   ├── package.json              # NPM bağımlılıkları
│   ├── package-lock.json         # NPM lock dosyası
│   ├── postcss.config.js         # PostCSS konfigürasyonu
│   ├── tailwind.config.ts        # Tailwind CSS konfigürasyonu
│   ├── tsconfig.json             # TypeScript ana konfigürasyonu
│   ├── tsconfig.app.json         # TypeScript uygulama konfigürasyonu
│   ├── tsconfig.node.json        # TypeScript Node konfigürasyonu
│   ├── vercel.json               # Vercel deployment konfigürasyonu
│   └── vite.config.ts            # Vite build konfigürasyonu
│
├── 📁 Dokümantasyon
│   ├── README.md                 # Bu dosya
│   ├── FOTOĞRAF_YÜKLEME_TEST.md  # Fotoğraf yükleme testi
│   ├── INSTAGRAM_SETUP.md        # Instagram kurulum rehberi
│   └── supabase_dashboard_instructions.md # Supabase dashboard rehberi
│
└── 📁 SQL Dosyaları (Geliştirme)
    ├── add_watermark_column.sql
    ├── check_database_permissions.sql
    ├── check_profiles_structure.sql
    ├── check_settings_table.sql
    ├── check_storage_files.sql
    ├── check_supabase_status.sql
    ├── complete_hesaplama_migration.sql
    ├── complete_rls_setup.sql
    ├── create_all_tables.sql
    ├── create_all_tables_fixed.sql
    ├── create_profiles_table.sql
    ├── create_settings_table.sql
    ├── create_user.sql
    ├── create_user_final.sql
    ├── fix_authentication_issue.sql
    ├── fix_database_errors.sql
    ├── fix_deployment_issues.sql
    ├── fix_deployment_issues_updated.sql
    ├── fix_hesaplama_backup_rls.sql
    ├── fix_infinite_recursion.sql
    ├── fix_logo_url.sql
    ├── fix_profiles_table.sql
    ├── fix_rls_policies.sql
    ├── fix_storage_bucket.sql
    ├── fix_storage_rls_for_watermark.sql
    ├── fix_watermark_complete.sql
    ├── fixed_rls_setup.sql
    ├── hesaplama_migration.sql
    ├── hesaplama_migration_fix.sql
    ├── rls_all_tables.sql
    ├── rls_settings.sql
    ├── simple_bucket_fix.sql
    ├── simple_hesaplama_migration.sql
    ├── storage_rls.sql
    ├── watermark_settings_migration.sql
    └── watermark_settings_migration_fixed.sql
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

# Geliştirme sunucusu
npm run dev

# Production preview
npm run start
```

### Yeni Özellik Ekleme
1. İlgili bileşeni `src/components/` altında oluşturun
2. Gerekirse custom hook ekleyin `src/hooks/` altına
3. Supabase tablosu gerekiyorsa migration oluşturun
4. RLS politikalarını güncelleyin
5. TypeScript tiplerini tanımlayın
6. Test edin ve dokümante edin

### Veritabanı Migration'ları
```bash
# Yeni migration oluştur
supabase migration new migration_name

# Migration'ı uygula
supabase db push

# Migration'ı geri al
supabase db reset
```

### Bileşen Geliştirme Kuralları
- Her bileşen maksimum 300 satır olmalı
- TypeScript kullanın (.tsx uzantısı)
- Prop'lar için interface tanımlayın
- Error boundary kullanın
- Loading state'leri ekleyin
- Responsive tasarım uygulayın
- Accessibility kurallarına uyun

## 🚀 Deployment

### Vercel ile Otomatik Deployment
1. Vercel hesabınıza bağlayın
2. GitHub repository'sini import edin
3. Ortam değişkenlerini ayarlayın:
   ```
   VITE_SUPABASE_URL=your_supabase_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```
4. Otomatik deployment aktif olacaktır

### Manuel Build
```bash
# Production build
npm run build

# Build önizleme
npm run start
```

Build dosyaları `dist/` klasöründe oluşturulur.

### Deployment Kontrol Listesi
- [ ] Ortam değişkenleri ayarlandı
- [ ] Supabase RLS politikaları aktif
- [ ] Build hataları yok
- [ ] TypeScript hataları yok
- [ ] ESLint uyarıları minimum
- [ ] Performance testleri yapıldı
- [ ] SEO meta tagları eklendi
- [ ] PWA manifest güncel
- [ ] Service Worker çalışıyor

## 🔐 Güvenlik

### Authentication
- Supabase Auth ile JWT tabanlı kimlik doğrulama
- Admin rolleri için özel yetkilendirme
- Güvenli session yönetimi
- Password reset fonksiyonu
- Email verification

### Row Level Security (RLS)
- Tüm tablolarda RLS aktif
- Kullanıcı bazlı veri erişim kontrolü
- Admin yetkilerinin ayrı politikalarla yönetimi
- Recursive policy koruması
- Anon ve authenticated roller için ayrı izinler

### Veri Güvenliği
- SQL injection koruması
- XSS koruması
- CSRF koruması
- Güvenli dosya yükleme
- Input validation
- Output sanitization

### Güvenlik Best Practices
- API key'leri environment variable'larda
- Sensitive data'yı client-side'da saklamama
- HTTPS zorunluluğu
- Content Security Policy (CSP)
- Rate limiting

## 📊 Performans

### Optimizasyonlar
- Code splitting ile lazy loading
- Image optimization ve lazy loading
- React Query ile akıllı caching
- Bundle size optimization
- Tree shaking
- Gzip compression
- CDN kullanımı

### Monitoring
- Error boundary'ler
- Performance monitoring
- User analytics
- Real User Monitoring (RUM)
- Core Web Vitals tracking

### Performance Metrikleri
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- First Input Delay (FID)
- Cumulative Layout Shift (CLS)
- Time to Interactive (TTI)

## 🧪 Test

### Test Türleri
- Unit testler (Jest)
- Integration testler
- E2E testler (Playwright)
- Visual regression testler
- Performance testler

### Test Komutları
```bash
# Unit testler
npm run test

# Test coverage
npm run test:coverage

# E2E testler
npm run test:e2e
```

## 🤝 Katkıda Bulunma

### Geliştirme Süreci
1. Issue oluşturun veya mevcut issue'yu seçin
2. Fork yapın
3. Feature branch oluşturun (`git checkout -b feature/amazing-feature`)
4. Değişikliklerinizi yapın
5. Test edin
6. Commit yapın (`git commit -m 'feat: Add amazing feature'`)
7. Push yapın (`git push origin feature/amazing-feature`)
8. Pull Request oluşturun

### Commit Mesaj Formatı
```
type(scope): description

[optional body]

[optional footer]
```

**Tipler:**
- `feat`: Yeni özellik
- `fix`: Bug düzeltmesi
- `docs`: Dokümantasyon
- `style`: Kod formatı
- `refactor`: Kod refactoring
- `test`: Test ekleme/düzeltme
- `chore`: Build/config değişiklikleri

### Code Review Süreci
- Tüm testler geçmeli
- Code coverage %80 üzerinde olmalı
- ESLint kurallarına uymalı
- TypeScript hataları olmamalı
- Performance impact değerlendirilmeli
- Security review yapılmalı

## 📝 Lisans

Bu proje özel lisans altındadır. Kullanım için izin gereklidir.

## 📞 İletişim

- **Web**: [kumlufolyo.com](https://kumlufolyo.com)
- **Email**: info@kumlufolyo.com
- **Telefon**: +90 XXX XXX XX XX
- **Adres**: [Adres bilgisi]

## 🔄 Güncellemeler

### v2.1.0 (2025-01-18) - Son Güncelleme
- ✅ **Loading State Düzeltmeleri**: Auth.tsx ve Admin.tsx'te loading döngü sorunları çözüldü
- ✅ **Error Handling İyileştirmeleri**: Kapsamlı hata yönetimi eklendi
- ✅ **Supabase RLS Politikaları**: Tüm tablolar için güvenlik politikaları güncellendi
- ✅ **Form Optimizasyonları**: Benzersiz id/name, label-input eşleştirmeleri, autocomplete
- ✅ **Authentication Döngü Sorunu**: Sonsuz yükleme durumu çözüldü
- ✅ **TypeScript ve ESLint**: Kod kalitesi iyileştirmeleri
- ✅ **Performance Optimizasyonları**: Bundle size ve loading süreleri iyileştirildi
- ✅ **PWA Güncellemeleri**: Service Worker ve manifest iyileştirmeleri
- ✅ **Responsive Design**: Mobil uyumluluk geliştirmeleri
- ✅ **SEO İyileştirmeleri**: Meta taglar ve structured data

### v2.0.0 (2025-01-15)
- ✅ Supabase entegrasyonu tamamlandı
- ✅ Admin panel eklendi
- ✅ Authentication sistemi kuruldu
- ✅ CRUD işlemleri iyileştirildi
- ✅ Responsive tasarım uygulandı

### v1.0.0 (2024-12-01)
- ✅ İlk versiyon yayınlandı
- ✅ Temel özellikler eklendi
- ✅ UI/UX tasarımı tamamlandı

## 🎯 Gelecek Planları

### v2.2.0 (Planlanan)
- [ ] **Multi-language Support**: Çoklu dil desteği
- [ ] **Advanced Analytics**: Detaylı analitik dashboard
- [ ] **Push Notifications**: Mobil push bildirimleri
- [ ] **Offline Support**: Çevrimdışı çalışma desteği
- [ ] **Advanced Search**: Gelişmiş arama ve filtreleme
- [ ] **API Documentation**: Swagger/OpenAPI dokümantasyonu

### v3.0.0 (Uzun Vadeli)
- [ ] **Microservices Architecture**: Mikroservis mimarisi
- [ ] **GraphQL API**: GraphQL entegrasyonu
- [ ] **AI Integration**: Yapay zeka özellikleri
- [ ] **Advanced CMS**: İçerik yönetim sistemi
- [ ] **E-commerce Integration**: E-ticaret entegrasyonu

---

**Geliştirici**: SOLO Coding AI Assistant  
**Son Güncelleme**: 18 Ocak 2025  
**Versiyon**: 2.1.0  
**Build**: Production Ready ✅
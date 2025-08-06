-- Tüm gerekli tabloları oluştur (Düzeltilmiş versiyon)
-- Bu komutları Supabase SQL Editor'da çalıştırın

-- 1. Ayarlar tablosu
CREATE TABLE IF NOT EXISTS public.ayarlar (
  id SERIAL PRIMARY KEY,
  anahtar TEXT UNIQUE NOT NULL,
  deger TEXT,
  aciklama TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Kategoriler tablosu
CREATE TABLE IF NOT EXISTS public.kategoriler (
  id SERIAL PRIMARY KEY,
  ad TEXT NOT NULL,
  aciklama TEXT,
  sira INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Fotograflar tablosu
CREATE TABLE IF NOT EXISTS public.fotograflar (
  id SERIAL PRIMARY KEY,
  dosya_adi TEXT NOT NULL,
  dosya_yolu TEXT NOT NULL,
  baslik TEXT,
  aciklama TEXT,
  kategori_id INTEGER REFERENCES public.kategoriler(id) ON DELETE SET NULL,
  sira INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Kampanyalar tablosu
CREATE TABLE IF NOT EXISTS public.kampanyalar (
  id SERIAL PRIMARY KEY,
  kampanya_adi TEXT NOT NULL,
  platform TEXT NOT NULL CHECK (platform IN ('google_ads', 'instagram', 'facebook')),
  durum TEXT NOT NULL DEFAULT 'aktif',
  butce_gunluk DECIMAL(10,2),
  kategori_id INTEGER REFERENCES public.kategoriler(id) ON DELETE SET NULL,
  aciklama TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. Servis bedelleri tablosu
CREATE TABLE IF NOT EXISTS public.servis_bedelleri (
  id SERIAL PRIMARY KEY,
  servis_adi TEXT NOT NULL,
  fiyat DECIMAL(10,2) NOT NULL,
  birim TEXT DEFAULT 'm2',
  aciklama TEXT,
  aktif BOOLEAN DEFAULT true,
  sira INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. Hesaplama ürünleri tablosu
CREATE TABLE IF NOT EXISTS public.hesaplama_urunleri (
  id SERIAL PRIMARY KEY,
  urun_adi TEXT NOT NULL,
  fiyat DECIMAL(10,2) NOT NULL,
  birim TEXT DEFAULT 'm2',
  aciklama TEXT,
  aktif BOOLEAN DEFAULT true,
  sira INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. Video galeri tablosu
CREATE TABLE IF NOT EXISTS public.video_galeri (
  id SERIAL PRIMARY KEY,
  video_adi TEXT NOT NULL,
  youtube_url TEXT NOT NULL,
  aciklama TEXT,
  sira INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. Varsayılan ayarları ekle
INSERT INTO public.ayarlar (anahtar, deger, aciklama) VALUES
('site_baslik', 'Kumlu Folyo', 'Site basligi'),
('site_aciklama', 'Profesyonel cam kumlama hizmetleri', 'Site aciklamasi'),
('telefon', '+90 XXX XXX XX XX', 'Iletisim telefonu'),
('email', 'info@kumlufolyo.com', 'Iletisim e-posta adresi'),
('adres', 'Istanbul, Turkiye', 'Sirket adresi'),
('instagram_username', '', 'Instagram kullanici adi'),
('instagram_access_token', '', 'Instagram Basic Display API access token'),
('instagram_enabled', 'false', 'Instagram akisini goster/gizle'),
('instagram_post_count', '6', 'Gosterilecek Instagram post sayisi'),
('instagram_cache_duration', '3600', 'Instagram verilerinin cache suresi (saniye)'),
('whatsapp_number', '+90 XXX XXX XX XX', 'WhatsApp numarasi'),
('whatsapp_message', 'Merhaba, cam kumlama hizmeti hakkinda bilgi almak istiyorum.', 'Varsayilan WhatsApp mesaji'),
('whatsapp_enabled', 'true', 'WhatsApp butonunu goster/gizle'),
('brand_popup_enabled', 'true', 'Marka logolari pop-up goster/gizle'),
('brand_popup_title', 'Kullandigimiz Markalar', 'Pop-up basligi'),
('brand_popup_description', 'Kaliteli hizmet icin tercih ettigimiz markalar', 'Pop-up aciklamasi'),
('brand_popup_duration', '3000', 'Pop-up suresi (milisaniye)'),
('brand_logo_1_name', '', 'Marka 1 adi'),
('brand_logo_1_image', '', 'Marka 1 logosu'),
('brand_logo_1_description', '', 'Marka 1 aciklamasi'),
('brand_logo_2_name', '', 'Marka 2 adi'),
('brand_logo_2_image', '', 'Marka 2 logosu'),
('brand_logo_2_description', '', 'Marka 2 aciklamasi'),
('brand_logo_3_name', '', 'Marka 3 adi'),
('brand_logo_3_image', '', 'Marka 3 logosu'),
('brand_logo_3_description', '', 'Marka 3 aciklamasi'),
('brand_logo_4_name', '', 'Marka 4 adi'),
('brand_logo_4_image', '', 'Marka 4 logosu'),
('brand_logo_4_description', '', 'Marka 4 aciklamasi'),
('brand_logo_5_name', '', 'Marka 5 adi'),
('brand_logo_5_image', '', 'Marka 5 logosu'),
('brand_logo_5_description', '', 'Marka 5 aciklamasi'),
('brand_logo_6_name', '', 'Marka 6 adi'),
('brand_logo_6_image', '', 'Marka 6 logosu'),
('brand_logo_6_description', '', 'Marka 6 aciklamasi')
ON CONFLICT (anahtar) DO NOTHING;

-- 9. Varsayılan kategorileri ekle
INSERT INTO public.kategoriler (ad, aciklama, sira) VALUES
('Cam Kumlama', 'Cam kumlama islemleri', 1),
('Arac Giydirme', 'Arac giydirme hizmetleri', 2),
('Tabelalar', 'Tabela ve reklam panolari', 3),
('Referanslar', 'Tamamlanan projeler', 4)
ON CONFLICT DO NOTHING;

-- 10. Varsayılan servis bedellerini ekle
INSERT INTO public.servis_bedelleri (servis_adi, fiyat, birim, aciklama, sira) VALUES
('Cam Kumlama', 25.00, 'm2', 'Standart cam kumlama islemi', 1),
('Arac Giydirme', 150.00, 'm2', 'Arac cam giydirme', 2),
('Tabela Yapimi', 80.00, 'm2', 'Reklam tabelasi yapimi', 3)
ON CONFLICT DO NOTHING;

-- 11. Varsayılan hesaplama ürünlerini ekle
INSERT INTO public.hesaplama_urunleri (urun_adi, fiyat, birim, aciklama, sira) VALUES
('Cam Kumlama', 25.00, 'm2', 'Standart cam kumlama', 1),
('Arac Giydirme', 150.00, 'm2', 'Arac cam giydirme', 2),
('Tabela', 80.00, 'm2', 'Reklam tabelasi', 3)
ON CONFLICT DO NOTHING; 
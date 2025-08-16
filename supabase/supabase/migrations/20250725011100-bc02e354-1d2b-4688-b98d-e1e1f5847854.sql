-- Fotoğraflar tablosuna kullanım alanı kolonu ekle
ALTER TABLE public.fotograflar 
ADD COLUMN kullanim_alani text[] DEFAULT '{}',
ADD COLUMN kategori_adi text,
ADD COLUMN gorsel_tipi text DEFAULT 'galeri';

-- Firma bilgileri için ayarlar tablosuna kayıtlar ekle
INSERT INTO public.ayarlar (anahtar, deger, aciklama) VALUES
('firma_adi', '', 'Firma adı'),
('firma_website', '', 'Firma website adresi'),
('firma_telefon', '', 'Firma telefon numarası'),
('firma_email', '', 'Firma e-posta adresi'),
('firma_adres', '', 'Firma adresi'),
('firma_logo_url', '', 'Firma logo dosya yolu')
ON CONFLICT (anahtar) DO NOTHING;

-- Kategori ekleme/düzenleme için RLS güncellemesi (zaten var ama kontrol edelim)
-- Kategoriler tablosuna varsayılan kategoriler ekle
INSERT INTO public.kategoriler (ad, slug, tip, aciklama, aktif, sira_no) VALUES
('Ana Sayfa Slider', 'ana-sayfa-slider', 'kumlama', 'Ana sayfa slider fotoğrafları', true, 1),
('Galeri', 'galeri', 'kumlama', 'Fotoğraf galeri görüntüleri', true, 2),
('Referanslar', 'referanslar', 'kumlama', 'Referans çalışmaları', true, 3),
('Hakkımızda', 'hakkimizda', 'kumlama', 'Hakkımızda sayfa görselleri', true, 4),
('Tabela Örnekleri', 'tabela-ornekleri', 'tabela', 'Tabela çalışma örnekleri', true, 5)
ON CONFLICT (slug) DO NOTHING;
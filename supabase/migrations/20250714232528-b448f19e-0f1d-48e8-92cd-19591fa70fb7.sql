-- Kategori türleri için enum
CREATE TYPE public.kategori_tipi AS ENUM (
  'kumlama',
  'tabela'
);

-- Servis kategorileri tablosu
CREATE TABLE public.kategoriler (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ad TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  aciklama TEXT,
  tip kategori_tipi NOT NULL,
  sira_no INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Fotoğraflar tablosu
CREATE TABLE public.fotograflar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  kategori_id UUID REFERENCES public.kategoriler(id) ON DELETE CASCADE,
  baslik TEXT,
  aciklama TEXT,
  dosya_yolu TEXT NOT NULL,
  thumbnail_yolu TEXT,
  logo_eklendi BOOLEAN DEFAULT false,
  boyut INTEGER,
  mime_type TEXT,
  sira_no INTEGER DEFAULT 0,
  aktif BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Sayfa içerikleri (anasayfa slider, açıklamalar vs.)
CREATE TABLE public.sayfa_icerikleri (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  sayfa_adi TEXT NOT NULL,
  alan_adi TEXT NOT NULL,
  icerik TEXT,
  icerik_tipi TEXT DEFAULT 'text', -- text, html, json
  aktif BOOLEAN DEFAULT true,
  sira_no INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(sayfa_adi, alan_adi)
);

-- Ayarlar tablosu (telefon, adres, sosyal medya vs.)
CREATE TABLE public.ayarlar (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  anahtar TEXT NOT NULL UNIQUE,
  deger TEXT,
  aciklama TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- RLS politikalarını etkinleştir
ALTER TABLE public.kategoriler ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotograflar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sayfa_icerikleri ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ayarlar ENABLE ROW LEVEL SECURITY;

-- Herkese okuma izni ver (public site)
CREATE POLICY "Kategoriler herkese görünür" 
ON public.kategoriler 
FOR SELECT 
USING (aktif = true);

CREATE POLICY "Fotoğraflar herkese görünür" 
ON public.fotograflar 
FOR SELECT 
USING (aktif = true);

CREATE POLICY "Sayfa içerikleri herkese görünür" 
ON public.sayfa_icerikleri 
FOR SELECT 
USING (aktif = true);

CREATE POLICY "Ayarlar herkese görünür" 
ON public.ayarlar 
FOR SELECT 
USING (true);

-- Timestamp güncellemek için fonksiyon
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Timestamp tetikleyicileri
CREATE TRIGGER update_kategoriler_updated_at
  BEFORE UPDATE ON public.kategoriler
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_fotograflar_updated_at
  BEFORE UPDATE ON public.fotograflar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_sayfa_icerikleri_updated_at
  BEFORE UPDATE ON public.sayfa_icerikleri
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_ayarlar_updated_at
  BEFORE UPDATE ON public.ayarlar
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Başlangıç kategorileri
INSERT INTO public.kategoriler (ad, slug, tip, aciklama, sira_no) VALUES
('Cam Kumlama', 'cam-kumlama', 'kumlama', 'Geleneksel cam kumlama işlemleri', 1),
('Baskılı Kumlu Folyo', 'baskili-kumlu-folyo', 'kumlama', 'Özel tasarım baskılı kumlu folyolar', 2),
('Folyo Kesim', 'folyo-kesim', 'kumlama', 'Hassas folyo kesim hizmetleri', 3),
('Amerikan Çizilmez Cam Film', 'amerikan-cizilmez-cam-film', 'kumlama', 'Yüksek kalite çizilmez cam filmleri', 4),
('Dijital Baskı', 'dijital-baski', 'kumlama', 'Vinil, folyo, mesh ve afiş baskıları', 5),
('One Way Vision', 'one-way-vision', 'kumlama', 'Delikli folyo uygulamaları', 6),
('Yönlendirme Tabelaları', 'yonlendirme', 'tabela', 'İç ve dış mekan yönlendirme tabelaları', 1),
('Vinil Germe', 'vinil-germe', 'tabela', 'Profesyonel vinil germe hizmetleri', 2),
('Kutu Harf', 'kutu-harf', 'tabela', '3D kutu harf uygulamaları', 3),
('Pleksi Tabelalar', 'pleksi-tabela', 'tabela', 'Şeffaf ve renkli pleksi tabelalar', 4),
('Alüminyum Tabelalar', 'aluminyum-tabela', 'tabela', 'Dayanıklı alüminyum tabela çözümleri', 5);

-- Temel ayarları ekle
INSERT INTO public.ayarlar (anahtar, deger, aciklama) VALUES
('telefon', '+90 555 123 45 67', 'İşletme telefon numarası'),
('instagram_username', '', 'Instagram kullanıcı adı'),
('firma_adi', 'Cam Kumlama Atölyesi', 'Firma adı'),
('adres', '', 'Firma adresi'),
('email', '', 'İletişim e-postası'),
('calisma_saatleri', 'Pazartesi - Cumartesi: 08:00 - 18:00', 'Çalışma saatleri');

-- Storage bucket oluştur
INSERT INTO storage.buckets (id, name, public) VALUES ('fotograflar', 'fotograflar', true);

-- Storage politikaları
CREATE POLICY "Fotoğraflar herkese görünür" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'fotograflar');

CREATE POLICY "Kimliği doğrulanmış kullanıcılar fotoğraf yükleyebilir" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'fotograflar' AND auth.role() = 'authenticated');

CREATE POLICY "Kimliği doğrulanmış kullanıcılar fotoğraf güncelleyebilir" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'fotograflar' AND auth.role() = 'authenticated');

CREATE POLICY "Kimliği doğrulanmış kullanıcılar fotoğraf silebilir" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'fotograflar' AND auth.role() = 'authenticated');
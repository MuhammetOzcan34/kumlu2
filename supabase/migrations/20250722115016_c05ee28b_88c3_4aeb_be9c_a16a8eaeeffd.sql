-- Önce sabit admin hesabı için geçici kullanıcı oluşturma
-- NOT: Bu migration sadece geliştirme aşamasında kullanılmalı

-- Admin kullanıcısını manuel olarak oluşturmak için hazırlık
-- Gerçek projede admin hesabı Supabase dashboard'dan oluşturulmalı

-- Eğer admin@camkumlama.com kullanıcısı varsa admin yap
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@camkumlama.com'
);

-- Hesaplama ürünleri için yeni tablo oluştur
CREATE TABLE public.hesaplama_urunleri (
    id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
    ad text NOT NULL,
    aciklama text,
    birim_fiyat numeric NOT NULL DEFAULT 0,
    birim text NOT NULL DEFAULT 'm²',
    kategori text,
    aktif boolean DEFAULT true,
    sira_no integer DEFAULT 0,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- RLS politikaları
ALTER TABLE public.hesaplama_urunleri ENABLE ROW LEVEL SECURITY;

-- Herkes ürünleri görebilir
CREATE POLICY "Hesaplama ürünleri herkese görünür" 
ON public.hesaplama_urunleri 
FOR SELECT 
USING (aktif = true);

-- Sadece adminler ürünleri ekleyebilir/düzenleyebilir/silebilir
CREATE POLICY "Admins can insert hesaplama urunleri" 
ON public.hesaplama_urunleri 
FOR INSERT 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update hesaplama urunleri" 
ON public.hesaplama_urunleri 
FOR UPDATE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can delete hesaplama urunleri" 
ON public.hesaplama_urunleri 
FOR DELETE 
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- Güncelleme trigger'ı ekle
CREATE TRIGGER update_hesaplama_urunleri_updated_at
BEFORE UPDATE ON public.hesaplama_urunleri
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Örnek ürünler ekle
INSERT INTO public.hesaplama_urunleri (ad, aciklama, birim_fiyat, birim, kategori, sira_no) VALUES
('Cam Kumlama (Basit)', 'Basit cam kumlama işlemi', 50, 'm²', 'Cam Kumlama', 1),
('Cam Kumlama (Detaylı)', 'Detaylı cam kumlama işlemi', 80, 'm²', 'Cam Kumlama', 2),
('Cam Kumlama (Renkli)', 'Renkli cam kumlama işlemi', 120, 'm²', 'Cam Kumlama', 3),
('Alüminyum Tabela', 'Alüminyum tabela üretimi', 200, 'm²', 'Tabela', 4),
('Pleksi Tabela', 'Pleksi tabela üretimi', 150, 'm²', 'Tabela', 5),
('Vinil Baskı', 'Vinil baskı uygulaması', 25, 'm²', 'Baskı', 6),
('Folyo Uygulama', 'Folyo uygulama hizmeti', 35, 'm²', 'Uygulama', 7),
('Mesh Baskı', 'Mesh baskı uygulaması', 15, 'm²', 'Baskı', 8);
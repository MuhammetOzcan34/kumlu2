-- Tüm tablolar için RLS politikaları
-- Bu komutları Supabase SQL Editor'da çalıştırın

-- 1. Kategoriler tablosu için RLS
ALTER TABLE public.kategoriler ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to categories" ON public.kategoriler
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage categories" ON public.kategoriler
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Fotograflar tablosu için RLS
ALTER TABLE public.fotograflar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to photos" ON public.fotograflar
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage photos" ON public.fotograflar
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Kampanyalar tablosu için RLS
ALTER TABLE public.kampanyalar ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to campaigns" ON public.kampanyalar
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage campaigns" ON public.kampanyalar
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Servis bedelleri tablosu için RLS
ALTER TABLE public.servis_bedelleri ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to service fees" ON public.servis_bedelleri
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage service fees" ON public.servis_bedelleri
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Hesaplama ürünleri tablosu için RLS
ALTER TABLE public.hesaplama_urunleri ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to calculation products" ON public.hesaplama_urunleri
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage calculation products" ON public.hesaplama_urunleri
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Video galeri tablosu için RLS
ALTER TABLE public.video_galeri ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to video gallery" ON public.video_galeri
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage video gallery" ON public.video_galeri
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Marka logoları tablosu için RLS (eğer varsa)
-- ALTER TABLE public.marka_logolari ENABLE ROW LEVEL SECURITY;
-- CREATE POLICY "Allow public read access to brand logos" ON public.marka_logolari
--   FOR SELECT USING (true);
-- CREATE POLICY "Allow admin manage brand logos" ON public.marka_logolari
--   FOR ALL USING (
--     EXISTS (
--       SELECT 1 FROM public.profiles 
--       WHERE user_id = auth.uid() AND role = 'admin'
--     )
--   ); 
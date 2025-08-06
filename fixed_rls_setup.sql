-- Tüm tablolar için eksik RLS politikalarını ekle (Düzeltilmiş)
-- Bu komutları Supabase SQL Editor'da çalıştırın

-- 1. Kategoriler tablosu için RLS
ALTER TABLE public.kategoriler ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to categories" ON public.kategoriler;
CREATE POLICY "Allow public read access to categories" ON public.kategoriler
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin manage categories" ON public.kategoriler;
CREATE POLICY "Allow admin manage categories" ON public.kategoriler
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Fotograflar tablosu için RLS
ALTER TABLE public.fotograflar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to photos" ON public.fotograflar;
CREATE POLICY "Allow public read access to photos" ON public.fotograflar
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin manage photos" ON public.fotograflar;
CREATE POLICY "Allow admin manage photos" ON public.fotograflar
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Kampanyalar tablosu için RLS
ALTER TABLE public.kampanyalar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to campaigns" ON public.kampanyalar;
CREATE POLICY "Allow public read access to campaigns" ON public.kampanyalar
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin manage campaigns" ON public.kampanyalar;
CREATE POLICY "Allow admin manage campaigns" ON public.kampanyalar
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Servis bedelleri tablosu için RLS
ALTER TABLE public.servis_bedelleri ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to service fees" ON public.servis_bedelleri;
CREATE POLICY "Allow public read access to service fees" ON public.servis_bedelleri
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin manage service fees" ON public.servis_bedelleri;
CREATE POLICY "Allow admin manage service fees" ON public.servis_bedelleri
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Hesaplama ürünleri tablosu için RLS
ALTER TABLE public.hesaplama_urunleri ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to calculation products" ON public.hesaplama_urunleri;
CREATE POLICY "Allow public read access to calculation products" ON public.hesaplama_urunleri
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin manage calculation products" ON public.hesaplama_urunleri;
CREATE POLICY "Allow admin manage calculation products" ON public.hesaplama_urunleri
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 6. Video galeri tablosu için RLS
ALTER TABLE public.video_galeri ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to video gallery" ON public.video_galeri;
CREATE POLICY "Allow public read access to video gallery" ON public.video_galeri
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin manage video gallery" ON public.video_galeri;
CREATE POLICY "Allow admin manage video gallery" ON public.video_galeri
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Profiles tablosu için eksik politikaları ekle
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
CREATE POLICY "Users can insert their own profile" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 8. Ayarlar tablosu için eksik politikaları kontrol et
ALTER TABLE public.ayarlar ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow public read access to settings" ON public.ayarlar;
CREATE POLICY "Allow public read access to settings" ON public.ayarlar
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow admin update settings" ON public.ayarlar;
CREATE POLICY "Allow admin update settings" ON public.ayarlar
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Allow admin insert settings" ON public.ayarlar;
CREATE POLICY "Allow admin insert settings" ON public.ayarlar
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

DROP POLICY IF EXISTS "Allow admin delete settings" ON public.ayarlar;
CREATE POLICY "Allow admin delete settings" ON public.ayarlar
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  ); 
-- Mevcut RLS politikalarını sil ve yeniden oluştur
-- Bu komutları Supabase SQL Editor'da çalıştırın

-- 1. Ayarlar tablosu için mevcut politikaları sil
DROP POLICY IF EXISTS "Allow public read access to settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Allow admin update settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Allow admin insert settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Allow admin delete settings" ON public.ayarlar;

-- 2. Ayarlar tablosu için yeni politikalar oluştur
CREATE POLICY "Allow public read access to settings" ON public.ayarlar
  FOR SELECT USING (true);

CREATE POLICY "Allow admin update settings" ON public.ayarlar
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow admin insert settings" ON public.ayarlar
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

CREATE POLICY "Allow admin delete settings" ON public.ayarlar
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 3. Kategoriler tablosu için mevcut politikaları sil
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.kategoriler;
DROP POLICY IF EXISTS "Allow admin manage categories" ON public.kategoriler;

-- 4. Kategoriler tablosu için yeni politikalar oluştur
CREATE POLICY "Allow public read access to categories" ON public.kategoriler
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage categories" ON public.kategoriler
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 5. Fotograflar tablosu için mevcut politikaları sil
DROP POLICY IF EXISTS "Allow public read access to photos" ON public.fotograflar;
DROP POLICY IF EXISTS "Allow admin manage photos" ON public.fotograflar;

-- 6. Fotograflar tablosu için yeni politikalar oluştur
CREATE POLICY "Allow public read access to photos" ON public.fotograflar
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage photos" ON public.fotograflar
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 7. Kampanyalar tablosu için mevcut politikaları sil
DROP POLICY IF EXISTS "Allow public read access to campaigns" ON public.kampanyalar;
DROP POLICY IF EXISTS "Allow admin manage campaigns" ON public.kampanyalar;

-- 8. Kampanyalar tablosu için yeni politikalar oluştur
CREATE POLICY "Allow public read access to campaigns" ON public.kampanyalar
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage campaigns" ON public.kampanyalar
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 9. Servis bedelleri tablosu için mevcut politikaları sil
DROP POLICY IF EXISTS "Allow public read access to service fees" ON public.servis_bedelleri;
DROP POLICY IF EXISTS "Allow admin manage service fees" ON public.servis_bedelleri;

-- 10. Servis bedelleri tablosu için yeni politikalar oluştur
CREATE POLICY "Allow public read access to service fees" ON public.servis_bedelleri
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage service fees" ON public.servis_bedelleri
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 11. Hesaplama ürünleri tablosu için mevcut politikaları sil
DROP POLICY IF EXISTS "Allow public read access to calculation products" ON public.hesaplama_urunleri;
DROP POLICY IF EXISTS "Allow admin manage calculation products" ON public.hesaplama_urunleri;

-- 12. Hesaplama ürünleri tablosu için yeni politikalar oluştur
CREATE POLICY "Allow public read access to calculation products" ON public.hesaplama_urunleri
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage calculation products" ON public.hesaplama_urunleri
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 13. Video galeri tablosu için mevcut politikaları sil
DROP POLICY IF EXISTS "Allow public read access to video gallery" ON public.video_galeri;
DROP POLICY IF EXISTS "Allow admin manage video gallery" ON public.video_galeri;

-- 14. Video galeri tablosu için yeni politikalar oluştur
CREATE POLICY "Allow public read access to video gallery" ON public.video_galeri
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage video gallery" ON public.video_galeri
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  ); 
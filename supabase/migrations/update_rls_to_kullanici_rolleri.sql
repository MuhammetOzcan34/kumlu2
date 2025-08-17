-- RLS politikalarını kullanici_rolleri tablosunu kullanacak şekilde güncelle
-- Bu migration profiles.role yerine kullanici_rolleri tablosundaki role bilgisini kullanır

-- Önce kullanici_rolleri tablosu için RLS'yi etkinleştir
ALTER TABLE public.kullanici_rolleri ENABLE ROW LEVEL SECURITY;

-- kullanici_rolleri tablosu için politikalar
DROP POLICY IF EXISTS "Allow users to read their own role" ON public.kullanici_rolleri;
CREATE POLICY "Allow users to read their own role" ON public.kullanici_rolleri
  FOR SELECT USING (email = auth.email());

DROP POLICY IF EXISTS "Allow admin to manage all roles" ON public.kullanici_rolleri;
CREATE POLICY "Allow admin to manage all roles" ON public.kullanici_rolleri
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

-- 1. Kategoriler tablosu için RLS politikalarını güncelle
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.kategoriler;
DROP POLICY IF EXISTS "Allow admin manage categories" ON public.kategoriler;

CREATE POLICY "Allow public read access to categories" ON public.kategoriler
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage categories" ON public.kategoriler
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

-- 2. Kampanyalar tablosu için RLS politikalarını güncelle
DROP POLICY IF EXISTS "Allow public read access to campaigns" ON public.kampanyalar;
DROP POLICY IF EXISTS "Allow admin manage campaigns" ON public.kampanyalar;

CREATE POLICY "Allow public read access to campaigns" ON public.kampanyalar
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage campaigns" ON public.kampanyalar
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

-- 3. Servis bedelleri tablosu için RLS politikalarını güncelle
DROP POLICY IF EXISTS "Allow public read access to service fees" ON public.servis_bedelleri;
DROP POLICY IF EXISTS "Allow admin manage service fees" ON public.servis_bedelleri;

CREATE POLICY "Allow public read access to service fees" ON public.servis_bedelleri
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage service fees" ON public.servis_bedelleri
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

-- 4. Hesaplama ürünleri tablosu için RLS politikalarını güncelle
DROP POLICY IF EXISTS "Allow public read access to calculation products" ON public.hesaplama_urunleri;
DROP POLICY IF EXISTS "Allow admin manage calculation products" ON public.hesaplama_urunleri;

CREATE POLICY "Allow public read access to calculation products" ON public.hesaplama_urunleri
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage calculation products" ON public.hesaplama_urunleri
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

-- 5. Hesaplama fiyatları tablosu için RLS politikalarını güncelle
DROP POLICY IF EXISTS "Allow public read access to calculation prices" ON public.hesaplama_fiyatlar;
DROP POLICY IF EXISTS "Allow admin manage calculation prices" ON public.hesaplama_fiyatlar;

CREATE POLICY "Allow public read access to calculation prices" ON public.hesaplama_fiyatlar
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage calculation prices" ON public.hesaplama_fiyatlar
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

-- 6. Video galeri tablosu için RLS politikalarını güncelle
DROP POLICY IF EXISTS "Allow public read access to video gallery" ON public.video_galeri;
DROP POLICY IF EXISTS "Allow admin manage video gallery" ON public.video_galeri;

CREATE POLICY "Allow public read access to video gallery" ON public.video_galeri
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage video gallery" ON public.video_galeri
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

-- 7. Ek özellikler tablosu için RLS politikalarını güncelle
DROP POLICY IF EXISTS "Allow public read access to additional features" ON public.ek_ozellikler;
DROP POLICY IF EXISTS "Allow admin manage additional features" ON public.ek_ozellikler;

CREATE POLICY "Allow public read access to additional features" ON public.ek_ozellikler
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage additional features" ON public.ek_ozellikler
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

-- 8. Fotoğraflar tablosu için RLS politikalarını güncelle
DROP POLICY IF EXISTS "Allow public read access to photos" ON public.fotograflar;
DROP POLICY IF EXISTS "Allow admin manage photos" ON public.fotograflar;

CREATE POLICY "Allow public read access to photos" ON public.fotograflar
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage photos" ON public.fotograflar
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

-- 9. Marka logoları tablosu için RLS politikalarını güncelle
DROP POLICY IF EXISTS "Allow public read access to brand logos" ON public.marka_logolari;
DROP POLICY IF EXISTS "Allow admin manage brand logos" ON public.marka_logolari;

CREATE POLICY "Allow public read access to brand logos" ON public.marka_logolari
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage brand logos" ON public.marka_logolari
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

-- 10. Sayfa içerikleri tablosu için RLS politikalarını güncelle
DROP POLICY IF EXISTS "Allow public read access to page contents" ON public.sayfa_icerikleri;
DROP POLICY IF EXISTS "Allow admin manage page contents" ON public.sayfa_icerikleri;

CREATE POLICY "Allow public read access to page contents" ON public.sayfa_icerikleri
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage page contents" ON public.sayfa_icerikleri
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

-- 11. Reklam kampanyaları tablosu için RLS politikalarını güncelle
DROP POLICY IF EXISTS "Allow public read access to ad campaigns" ON public.reklam_kampanyalari;
DROP POLICY IF EXISTS "Allow admin manage ad campaigns" ON public.reklam_kampanyalari;

CREATE POLICY "Allow public read access to ad campaigns" ON public.reklam_kampanyalari
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage ad campaigns" ON public.reklam_kampanyalari
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

-- 12. Ayarlar tablosu için RLS politikalarını güncelle
DROP POLICY IF EXISTS "Allow public read access to settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Allow admin update settings" ON public.ayarlar;

CREATE POLICY "Allow public read access to settings" ON public.ayarlar
  FOR SELECT USING (true);

CREATE POLICY "Allow admin update settings" ON public.ayarlar
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

CREATE POLICY "Allow admin insert settings" ON public.ayarlar
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

CREATE POLICY "Allow admin delete settings" ON public.ayarlar
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

-- 13. Hesaplama ürünleri backup tablosu için RLS politikalarını güncelle
DROP POLICY IF EXISTS "Allow public read access to backup products" ON public.hesaplama_urunleri_backup;
DROP POLICY IF EXISTS "Allow admin manage backup products" ON public.hesaplama_urunleri_backup;

CREATE POLICY "Allow public read access to backup products" ON public.hesaplama_urunleri_backup
  FOR SELECT USING (true);

CREATE POLICY "Allow admin manage backup products" ON public.hesaplama_urunleri_backup
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

-- Gerekli izinleri ver
GRANT SELECT ON public.kullanici_rolleri TO anon;
GRANT SELECT ON public.kullanici_rolleri TO authenticated;

-- Başarı mesajı
DO $$
BEGIN
    RAISE NOTICE 'RLS politikaları başarıyla kullanici_rolleri tablosuna bağlandı!';
END $$;
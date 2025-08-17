-- Kullanici_rolleri tablosundaki sonsuz döngü sorununu düzelt
-- Sorun: kullanici_rolleri tablosundaki admin politikası kendisini referans ediyor

-- Önce mevcut politikaları kaldır
DROP POLICY IF EXISTS "Allow users to read their own role" ON public.kullanici_rolleri;
DROP POLICY IF EXISTS "Allow admin to manage all roles" ON public.kullanici_rolleri;

-- Kullanici_rolleri tablosu için basit politikalar oluştur
-- Kullanıcılar kendi rollerini görebilir
CREATE POLICY "Users can read own role" ON public.kullanici_rolleri
  FOR SELECT USING (email = auth.email());

-- Authenticated kullanıcılar tüm rolleri okuyabilir (admin kontrolü frontend'de yapılacak)
CREATE POLICY "Authenticated users can read all roles" ON public.kullanici_rolleri
  FOR SELECT USING (auth.role() = 'authenticated');

-- Admin işlemleri için service_role kullan (backend'den yapılacak)
-- Veya alternatif olarak is_super_admin flag'ini kullan
CREATE POLICY "Super admin can manage all roles" ON public.kullanici_rolleri
  FOR ALL USING (
    email = auth.email() AND is_super_admin = true
  );

-- Diğer tablolardaki admin politikalarını da güncelle
-- Kullanici_rolleri tablosuna referans veren politikaları düzelt

-- Kategoriler tablosu
DROP POLICY IF EXISTS "Allow admin manage categories" ON public.kategoriler;
CREATE POLICY "Allow admin manage categories" ON public.kategoriler
  FOR ALL USING (
    auth.email() IN (
      SELECT email FROM public.kullanici_rolleri 
      WHERE role = 'admin' OR is_super_admin = true
    )
  );

-- Kampanyalar tablosu
DROP POLICY IF EXISTS "Allow admin manage campaigns" ON public.kampanyalar;
CREATE POLICY "Allow admin manage campaigns" ON public.kampanyalar
  FOR ALL USING (
    auth.email() IN (
      SELECT email FROM public.kullanici_rolleri 
      WHERE role = 'admin' OR is_super_admin = true
    )
  );

-- Servis bedelleri tablosu
DROP POLICY IF EXISTS "Allow admin manage service fees" ON public.servis_bedelleri;
CREATE POLICY "Allow admin manage service fees" ON public.servis_bedelleri
  FOR ALL USING (
    auth.email() IN (
      SELECT email FROM public.kullanici_rolleri 
      WHERE role = 'admin' OR is_super_admin = true
    )
  );

-- Hesaplama ürünleri tablosu
DROP POLICY IF EXISTS "Allow admin manage calculation products" ON public.hesaplama_urunleri;
CREATE POLICY "Allow admin manage calculation products" ON public.hesaplama_urunleri
  FOR ALL USING (
    auth.email() IN (
      SELECT email FROM public.kullanici_rolleri 
      WHERE role = 'admin' OR is_super_admin = true
    )
  );

-- Hesaplama fiyatları tablosu
DROP POLICY IF EXISTS "Allow admin manage calculation prices" ON public.hesaplama_fiyatlar;
CREATE POLICY "Allow admin manage calculation prices" ON public.hesaplama_fiyatlar
  FOR ALL USING (
    auth.email() IN (
      SELECT email FROM public.kullanici_rolleri 
      WHERE role = 'admin' OR is_super_admin = true
    )
  );

-- Video galeri tablosu
DROP POLICY IF EXISTS "Allow admin manage video gallery" ON public.video_galeri;
CREATE POLICY "Allow admin manage video gallery" ON public.video_galeri
  FOR ALL USING (
    auth.email() IN (
      SELECT email FROM public.kullanici_rolleri 
      WHERE role = 'admin' OR is_super_admin = true
    )
  );

-- Ek özellikler tablosu
DROP POLICY IF EXISTS "Allow admin manage additional features" ON public.ek_ozellikler;
CREATE POLICY "Allow admin manage additional features" ON public.ek_ozellikler
  FOR ALL USING (
    auth.email() IN (
      SELECT email FROM public.kullanici_rolleri 
      WHERE role = 'admin' OR is_super_admin = true
    )
  );

-- Fotoğraflar tablosu
DROP POLICY IF EXISTS "Allow admin manage photos" ON public.fotograflar;
CREATE POLICY "Allow admin manage photos" ON public.fotograflar
  FOR ALL USING (
    auth.email() IN (
      SELECT email FROM public.kullanici_rolleri 
      WHERE role = 'admin' OR is_super_admin = true
    )
  );

-- Marka logoları tablosu
DROP POLICY IF EXISTS "Allow admin manage brand logos" ON public.marka_logolari;
CREATE POLICY "Allow admin manage brand logos" ON public.marka_logolari
  FOR ALL USING (
    auth.email() IN (
      SELECT email FROM public.kullanici_rolleri 
      WHERE role = 'admin' OR is_super_admin = true
    )
  );

-- Sayfa içerikleri tablosu
DROP POLICY IF EXISTS "Allow admin manage page contents" ON public.sayfa_icerikleri;
CREATE POLICY "Allow admin manage page contents" ON public.sayfa_icerikleri
  FOR ALL USING (
    auth.email() IN (
      SELECT email FROM public.kullanici_rolleri 
      WHERE role = 'admin' OR is_super_admin = true
    )
  );

-- Reklam kampanyaları tablosu
DROP POLICY IF EXISTS "Allow admin manage ad campaigns" ON public.reklam_kampanyalari;
CREATE POLICY "Allow admin manage ad campaigns" ON public.reklam_kampanyalari
  FOR ALL USING (
    auth.email() IN (
      SELECT email FROM public.kullanici_rolleri 
      WHERE role = 'admin' OR is_super_admin = true
    )
  );

-- Ayarlar tablosu
DROP POLICY IF EXISTS "Allow admin update settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Allow admin insert settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Allow admin delete settings" ON public.ayarlar;

CREATE POLICY "Allow admin update settings" ON public.ayarlar
  FOR UPDATE USING (
    auth.email() IN (
      SELECT email FROM public.kullanici_rolleri 
      WHERE role = 'admin' OR is_super_admin = true
    )
  );

CREATE POLICY "Allow admin insert settings" ON public.ayarlar
  FOR INSERT WITH CHECK (
    auth.email() IN (
      SELECT email FROM public.kullanici_rolleri 
      WHERE role = 'admin' OR is_super_admin = true
    )
  );

CREATE POLICY "Allow admin delete settings" ON public.ayarlar
  FOR DELETE USING (
    auth.email() IN (
      SELECT email FROM public.kullanici_rolleri 
      WHERE role = 'admin' OR is_super_admin = true
    )
  );

-- Hesaplama ürünleri backup tablosu
DROP POLICY IF EXISTS "Allow admin manage backup products" ON public.hesaplama_urunleri_backup;
CREATE POLICY "Allow admin manage backup products" ON public.hesaplama_urunleri_backup
  FOR ALL USING (
    auth.email() IN (
      SELECT email FROM public.kullanici_rolleri 
      WHERE role = 'admin' OR is_super_admin = true
    )
  );

-- Başarı mesajı
DO $$
BEGIN
    RAISE NOTICE 'Kullanici_rolleri tablosundaki sonsuz döngü sorunu düzeltildi!';
END $$;
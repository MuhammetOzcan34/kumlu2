-- Storage bucket ve RLS politikalarını kontrol et ve eksikleri tamamla

-- 1. Storage bucket'ını kontrol et ve oluştur
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'fotograflar',
  'fotograflar',
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
)
ON CONFLICT (id) DO NOTHING;

-- 2. Storage bucket için RLS politikalarını ekle
-- Önce mevcut politikaları sil
DROP POLICY IF EXISTS "Herkes fotograflari gorebilir" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated kullanicilar fotograf yukleyebilir" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated kullanicilar fotograf guncelleyebilir" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated kullanicilar fotograf silebilir" ON storage.objects;

-- Yeni politikaları oluştur
CREATE POLICY "Herkes fotograflari gorebilir" ON storage.objects
  FOR SELECT USING (bucket_id = 'fotograflar');

CREATE POLICY "Authenticated kullanicilar fotograf yukleyebilir" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'fotograflar' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated kullanicilar fotograf guncelleyebilir" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'fotograflar' AND 
    auth.role() = 'authenticated'
  );

CREATE POLICY "Authenticated kullanicilar fotograf silebilir" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'fotograflar' AND 
    auth.role() = 'authenticated'
  );

-- 3. Tüm tablolar için temel izinleri kontrol et ve ekle
-- anon rolü için SELECT izinleri
GRANT SELECT ON ayarlar TO anon;
GRANT SELECT ON kategoriler TO anon;
GRANT SELECT ON fotograflar TO anon;
GRANT SELECT ON servis_bedelleri TO anon;
GRANT SELECT ON video_galeri TO anon;
GRANT SELECT ON hesaplama_urunleri TO anon;
GRANT SELECT ON hesaplama_fiyatlar TO anon;
GRANT SELECT ON ek_ozellikler TO anon;
GRANT SELECT ON marka_logolari TO anon;
GRANT SELECT ON kampanyalar TO anon;
GRANT SELECT ON reklam_kampanyalari TO anon;

-- authenticated rolü için tam izinler
GRANT ALL PRIVILEGES ON ayarlar TO authenticated;
GRANT ALL PRIVILEGES ON kategoriler TO authenticated;
GRANT ALL PRIVILEGES ON fotograflar TO authenticated;
GRANT ALL PRIVILEGES ON servis_bedelleri TO authenticated;
GRANT ALL PRIVILEGES ON video_galeri TO authenticated;
GRANT ALL PRIVILEGES ON hesaplama_urunleri TO authenticated;
GRANT ALL PRIVILEGES ON hesaplama_fiyatlar TO authenticated;
GRANT ALL PRIVILEGES ON ek_ozellikler TO authenticated;
GRANT ALL PRIVILEGES ON marka_logolari TO authenticated;
GRANT ALL PRIVILEGES ON kampanyalar TO authenticated;
GRANT ALL PRIVILEGES ON reklam_kampanyalari TO authenticated;
GRANT ALL PRIVILEGES ON profiles TO authenticated;
GRANT ALL PRIVILEGES ON user_roles TO authenticated;

-- 4. Sequence'lar için izinler
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- 5. Eksik RLS politikalarını kontrol et
-- profiles tablosu için
DROP POLICY IF EXISTS "Kullanicilar kendi profillerini gorebilir" ON profiles;
DROP POLICY IF EXISTS "Kullanicilar kendi profillerini guncelleyebilir" ON profiles;

CREATE POLICY "Kullanicilar kendi profillerini gorebilir" ON profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Kullanicilar kendi profillerini guncelleyebilir" ON profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- user_roles tablosu için RLS'yi etkinleştir
ALTER TABLE user_roles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Kullanicilar kendi rollerini gorebilir" ON user_roles;

CREATE POLICY "Kullanicilar kendi rollerini gorebilir" ON user_roles
  FOR SELECT USING (auth.uid() = user_id);

-- 6. Genel okuma politikaları (anon kullanıcılar için)
-- Önce mevcut politikaları sil
DROP POLICY IF EXISTS "Herkes ayarlari gorebilir" ON ayarlar;
DROP POLICY IF EXISTS "Herkes kategorileri gorebilir" ON kategoriler;
DROP POLICY IF EXISTS "Herkes fotograflari gorebilir" ON fotograflar;
DROP POLICY IF EXISTS "Herkes servis bedellerini gorebilir" ON servis_bedelleri;
DROP POLICY IF EXISTS "Herkes video galerisini gorebilir" ON video_galeri;
DROP POLICY IF EXISTS "Herkes hesaplama urunlerini gorebilir" ON hesaplama_urunleri;
DROP POLICY IF EXISTS "Herkes hesaplama fiyatlarini gorebilir" ON hesaplama_fiyatlar;
DROP POLICY IF EXISTS "Herkes ek ozellikleri gorebilir" ON ek_ozellikler;
DROP POLICY IF EXISTS "Herkes marka logolarini gorebilir" ON marka_logolari;
DROP POLICY IF EXISTS "Herkes kampanyalari gorebilir" ON kampanyalar;
DROP POLICY IF EXISTS "Herkes reklam kampanyalarini gorebilir" ON reklam_kampanyalari;

-- Yeni politikaları oluştur
CREATE POLICY "Herkes ayarlari gorebilir" ON ayarlar
  FOR SELECT USING (true);

CREATE POLICY "Herkes kategorileri gorebilir" ON kategoriler
  FOR SELECT USING (aktif = true);

CREATE POLICY "Herkes fotograflari gorebilir" ON fotograflar
  FOR SELECT USING (aktif = true);

CREATE POLICY "Herkes servis bedellerini gorebilir" ON servis_bedelleri
  FOR SELECT USING (aktif = true);

CREATE POLICY "Herkes video galerisini gorebilir" ON video_galeri
  FOR SELECT USING (aktif = true);

CREATE POLICY "Herkes hesaplama urunlerini gorebilir" ON hesaplama_urunleri
  FOR SELECT USING (aktif = true);

CREATE POLICY "Herkes hesaplama fiyatlarini gorebilir" ON hesaplama_fiyatlar
  FOR SELECT USING (true);

CREATE POLICY "Herkes ek ozellikleri gorebilir" ON ek_ozellikler
  FOR SELECT USING (aktif = true);

CREATE POLICY "Herkes marka logolarini gorebilir" ON marka_logolari
  FOR SELECT USING (aktif = true);

CREATE POLICY "Herkes kampanyalari gorebilir" ON kampanyalar
  FOR SELECT USING (durum = 'aktif');

CREATE POLICY "Herkes reklam kampanyalarini gorebilir" ON reklam_kampanyalari
  FOR SELECT USING (durum = 'aktif');

-- 7. Authenticated kullanıcılar için yazma politikaları
-- Önce mevcut politikaları sil
DROP POLICY IF EXISTS "Authenticated kullanicilar ayar ekleyebilir" ON ayarlar;
DROP POLICY IF EXISTS "Authenticated kullanicilar ayar guncelleyebilir" ON ayarlar;
DROP POLICY IF EXISTS "Authenticated kullanicilar kategori ekleyebilir" ON kategoriler;
DROP POLICY IF EXISTS "Authenticated kullanicilar kategori guncelleyebilir" ON kategoriler;
DROP POLICY IF EXISTS "Authenticated kullanicilar fotograf ekleyebilir" ON fotograflar;
DROP POLICY IF EXISTS "Authenticated kullanicilar fotograf guncelleyebilir" ON fotograflar;
DROP POLICY IF EXISTS "Authenticated kullanicilar fotograf silebilir" ON fotograflar;

-- Yeni politikaları oluştur
CREATE POLICY "Authenticated kullanicilar ayar ekleyebilir" ON ayarlar
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated kullanicilar ayar guncelleyebilir" ON ayarlar
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated kullanicilar kategori ekleyebilir" ON kategoriler
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated kullanicilar kategori guncelleyebilir" ON kategoriler
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated kullanicilar fotograf ekleyebilir" ON fotograflar
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated kullanicilar fotograf guncelleyebilir" ON fotograflar
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated kullanicilar fotograf silebilir" ON fotograflar
  FOR DELETE USING (auth.role() = 'authenticated');
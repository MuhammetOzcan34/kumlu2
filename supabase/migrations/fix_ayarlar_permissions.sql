-- Ayarlar tablosu için RLS politikalarını ve izinleri kontrol et ve düzelt

-- Mevcut politikaları kontrol et
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename = 'ayarlar';

-- Mevcut izinleri kontrol et
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' AND table_name = 'ayarlar' AND grantee IN ('anon', 'authenticated');

-- Authenticated kullanıcılar için tam erişim ver
GRANT ALL PRIVILEGES ON ayarlar TO authenticated;

-- Anon kullanıcılar için okuma erişimi ver
GRANT SELECT ON ayarlar TO anon;

-- RLS politikalarını temizle ve yeniden oluştur
DROP POLICY IF EXISTS "Authenticated users can manage ayarlar" ON ayarlar;
DROP POLICY IF EXISTS "Public can read ayarlar" ON ayarlar;

-- Authenticated kullanıcılar için tam erişim politikası
CREATE POLICY "Authenticated users can manage ayarlar" ON ayarlar
    FOR ALL USING (auth.role() = 'authenticated');

-- Anon kullanıcılar için okuma politikası
CREATE POLICY "Public can read ayarlar" ON ayarlar
    FOR SELECT USING (true);

-- Sequence izinlerini de ver
GRANT USAGE, SELECT ON SEQUENCE ayarlar_id_seq TO authenticated;
GRANT SELECT ON SEQUENCE ayarlar_id_seq TO anon;
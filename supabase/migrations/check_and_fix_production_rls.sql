-- Production RLS politikalarını ve izinleri kontrol et ve düzelt

-- Mevcut politikaları kontrol et
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('ayarlar', 'fotograflar');

-- Mevcut izinleri kontrol et
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('ayarlar', 'fotograflar')
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Tüm mevcut politikaları sil
DROP POLICY IF EXISTS "ayarlar_select_policy" ON ayarlar;
DROP POLICY IF EXISTS "fotograflar_select_policy" ON fotograflar;
DROP POLICY IF EXISTS "Enable read access for all users" ON ayarlar;
DROP POLICY IF EXISTS "Enable read access for all users" ON fotograflar;
DROP POLICY IF EXISTS "Allow public read access" ON ayarlar;
DROP POLICY IF EXISTS "Allow public read access" ON fotograflar;

-- RLS'yi yeniden etkinleştir
ALTER TABLE ayarlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotograflar ENABLE ROW LEVEL SECURITY;

-- Tüm izinleri temizle ve yeniden ver
REVOKE ALL ON ayarlar FROM anon, authenticated;
REVOKE ALL ON fotograflar FROM anon, authenticated;

-- Temel izinleri ver
GRANT SELECT ON ayarlar TO anon;
GRANT SELECT ON ayarlar TO authenticated;
GRANT SELECT ON fotograflar TO anon;
GRANT SELECT ON fotograflar TO authenticated;

-- Yeni basit politikalar oluştur
CREATE POLICY "allow_public_read_ayarlar" ON ayarlar
    FOR SELECT
    USING (true);

CREATE POLICY "allow_public_read_fotograflar" ON fotograflar
    FOR SELECT
    USING (true);

-- Politikaları kontrol et
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'public' AND tablename IN ('ayarlar', 'fotograflar');

-- İzinleri kontrol et
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('ayarlar', 'fotograflar')
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;
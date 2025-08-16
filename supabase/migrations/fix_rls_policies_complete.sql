-- RLS politikalarını tamamen sil ve yeniden oluştur
-- Ayarlar ve fotograflar tablolarına anonim erişim sağla

-- Mevcut politikaları sil
DROP POLICY IF EXISTS "Herkes ayarları okuyabilir" ON ayarlar;
DROP POLICY IF EXISTS "Herkes fotografları okuyabilir" ON fotograflar;
DROP POLICY IF EXISTS "ayarlar_select_policy" ON ayarlar;
DROP POLICY IF EXISTS "fotograflar_select_policy" ON fotograflar;
DROP POLICY IF EXISTS "Enable read access for all users" ON ayarlar;
DROP POLICY IF EXISTS "Enable read access for all users" ON fotograflar;

-- Tablo izinlerini kontrol et ve ver
GRANT SELECT ON ayarlar TO anon;
GRANT SELECT ON ayarlar TO authenticated;
GRANT SELECT ON fotograflar TO anon;
GRANT SELECT ON fotograflar TO authenticated;

-- Yeni RLS politikalarını oluştur
CREATE POLICY "ayarlar_public_read" ON ayarlar
    FOR SELECT
    USING (true);

CREATE POLICY "fotograflar_public_read" ON fotograflar
    FOR SELECT
    USING (true);

-- RLS'nin etkin olduğunu doğrula
ALTER TABLE ayarlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotograflar ENABLE ROW LEVEL SECURITY;

-- Test sorguları
SELECT 'Ayarlar tablosu test' as test, COUNT(*) as kayit_sayisi FROM ayarlar;
SELECT 'Fotograflar tablosu test' as test, COUNT(*) as kayit_sayisi FROM fotograflar;

-- Politikaları kontrol et
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('ayarlar', 'fotograflar')
ORDER BY tablename, policyname;

-- Tablo izinlerini kontrol et
SELECT 
    table_name,
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('ayarlar', 'fotograflar')
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;
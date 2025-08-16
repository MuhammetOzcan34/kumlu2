-- RLS politikalarını tamamen sıfırla ve yeniden oluştur

-- Mevcut tüm politikaları sil
DROP POLICY IF EXISTS "Anonim kullanıcılar ayarları okuyabilir" ON ayarlar;
DROP POLICY IF EXISTS "Anonim kullanıcılar fotoğrafları okuyabilir" ON fotograflar;
DROP POLICY IF EXISTS "Herkes ayarları okuyabilir" ON ayarlar;
DROP POLICY IF EXISTS "Herkes fotoğrafları okuyabilir" ON fotograflar;
DROP POLICY IF EXISTS "Enable read access for all users" ON ayarlar;
DROP POLICY IF EXISTS "Enable read access for all users" ON fotograflar;

-- RLS'yi devre dışı bırak
ALTER TABLE ayarlar DISABLE ROW LEVEL SECURITY;
ALTER TABLE fotograflar DISABLE ROW LEVEL SECURITY;

-- Tablo izinlerini temizle
REVOKE ALL ON ayarlar FROM anon;
REVOKE ALL ON ayarlar FROM authenticated;
REVOKE ALL ON fotograflar FROM anon;
REVOKE ALL ON fotograflar FROM authenticated;

-- RLS'yi yeniden etkinleştir
ALTER TABLE ayarlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotograflar ENABLE ROW LEVEL SECURITY;

-- Yeni politikalar oluştur
CREATE POLICY "Ayarlar okuma izni" ON ayarlar
    FOR SELECT
    USING (true);

CREATE POLICY "Fotograflar okuma izni" ON fotograflar
    FOR SELECT
    USING (true);

-- Tablo izinlerini ver
GRANT SELECT ON ayarlar TO anon;
GRANT SELECT ON ayarlar TO authenticated;
GRANT SELECT ON fotograflar TO anon;
GRANT SELECT ON fotograflar TO authenticated;

-- Kontrol sorguları
SELECT 'RLS Politikaları:' as bilgi;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('ayarlar', 'fotograflar')
ORDER BY tablename, policyname;

SELECT 'Tablo İzinleri:' as bilgi;
SELECT 
    table_name,
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('ayarlar', 'fotograflar')
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;
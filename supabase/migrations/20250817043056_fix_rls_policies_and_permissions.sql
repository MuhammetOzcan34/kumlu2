-- RLS politikalarını ve tablo izinlerini düzelt

-- Önce mevcut politikaları temizle
DROP POLICY IF EXISTS "Herkes ayarları okuyabilir" ON ayarlar;
DROP POLICY IF EXISTS "Herkes fotoğrafları okuyabilir" ON fotograflar;

-- Ayarlar tablosu için yeni RLS politikası
CREATE POLICY "Anonim kullanıcılar ayarları okuyabilir" ON ayarlar
    FOR SELECT
    USING (true);

-- Fotograflar tablosu için yeni RLS politikası
CREATE POLICY "Anonim kullanıcılar fotoğrafları okuyabilir" ON fotograflar
    FOR SELECT
    USING (true);

-- Tablo izinlerini kontrol et ve gerekirse ekle
GRANT SELECT ON ayarlar TO anon;
GRANT SELECT ON ayarlar TO authenticated;
GRANT SELECT ON fotograflar TO anon;
GRANT SELECT ON fotograflar TO authenticated;

-- RLS'nin etkin olduğunu doğrula
ALTER TABLE ayarlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotograflar ENABLE ROW LEVEL SECURITY;

-- Kontrol sorguları
SELECT 'Ayarlar tablosu politikaları:' as bilgi;
SELECT policyname, permissive, roles, cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'ayarlar';

SELECT 'Fotograflar tablosu politikaları:' as bilgi;
SELECT policyname, permissive, roles, cmd FROM pg_policies WHERE schemaname = 'public' AND tablename = 'fotograflar';

SELECT 'Tablo izinleri:' as bilgi;
SELECT table_name, grantee, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('ayarlar', 'fotograflar')
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;
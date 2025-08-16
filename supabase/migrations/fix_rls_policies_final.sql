-- Mevcut RLS politikalarını temizle ve yenilerini oluştur
-- ayarlar tablosu için
DROP POLICY IF EXISTS "Anon can read settings" ON ayarlar;
DROP POLICY IF EXISTS "Allow anonymous read access" ON ayarlar;
DROP POLICY IF EXISTS "Enable read access for all users" ON ayarlar;

-- fotograflar tablosu için
DROP POLICY IF EXISTS "Anon can read public photos" ON fotograflar;
DROP POLICY IF EXISTS "Allow anonymous read access" ON fotograflar;
DROP POLICY IF EXISTS "Enable read access for all users" ON fotograflar;

-- Yeni RLS politikaları oluştur
-- ayarlar tablosu için anon erişimi
CREATE POLICY "Allow anonymous read settings" 
ON ayarlar 
FOR SELECT 
TO anon 
USING (true);

-- ayarlar tablosu için authenticated erişimi
CREATE POLICY "Allow authenticated read settings" 
ON ayarlar 
FOR SELECT 
TO authenticated 
USING (true);

-- fotograflar tablosu için anon erişimi (sadece aktif fotoğraflar)
CREATE POLICY "Allow anonymous read active photos" 
ON fotograflar 
FOR SELECT 
TO anon 
USING (aktif = true);

-- fotograflar tablosu için authenticated erişimi
CREATE POLICY "Allow authenticated read all photos" 
ON fotograflar 
FOR SELECT 
TO authenticated 
USING (true);

-- Rollere SELECT izinleri ver
GRANT SELECT ON ayarlar TO anon;
GRANT SELECT ON ayarlar TO authenticated;
GRANT SELECT ON fotograflar TO anon;
GRANT SELECT ON fotograflar TO authenticated;

-- Mevcut izinleri kontrol et
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated') 
AND table_name IN ('ayarlar', 'fotograflar')
ORDER BY table_name, grantee;
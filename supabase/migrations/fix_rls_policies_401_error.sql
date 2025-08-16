-- 401 Unauthorized hatalarını çözmek için RLS politikalarını düzelt
-- Mevcut politikaları sil ve anon kullanıcılar için yeni politikalar oluştur

-- Ayarlar tablosu için mevcut politikaları sil
DROP POLICY IF EXISTS "Anon can read settings" ON ayarlar;
DROP POLICY IF EXISTS "anon_select_ayarlar" ON ayarlar;
DROP POLICY IF EXISTS "Enable read access for all users" ON ayarlar;
DROP POLICY IF EXISTS "Allow anonymous read access" ON ayarlar;

-- Fotograflar tablosu için mevcut politikaları sil
DROP POLICY IF EXISTS "Anon can read public photos" ON fotograflar;
DROP POLICY IF EXISTS "anon_select_fotograflar" ON fotograflar;
DROP POLICY IF EXISTS "Enable read access for all users" ON fotograflar;
DROP POLICY IF EXISTS "Allow anonymous read access" ON fotograflar;
DROP POLICY IF EXISTS "Public photos are viewable by everyone" ON fotograflar;

-- RLS'yi etkinleştir (zaten etkin ama emin olmak için)
ALTER TABLE ayarlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotograflar ENABLE ROW LEVEL SECURITY;

-- Ayarlar tablosu için yeni policy oluştur
CREATE POLICY "Anon can read settings"
ON ayarlar
FOR SELECT
TO anon
USING (true);

-- Fotograflar tablosu için yeni policy oluştur (sadece aktif fotoğraflar)
CREATE POLICY "Anon can read public photos"
ON fotograflar
FOR SELECT
TO anon
USING (aktif = true);

-- Anon rolüne SELECT izinleri ver
GRANT SELECT ON ayarlar TO anon;
GRANT SELECT ON fotograflar TO anon;

-- Authenticated kullanıcılar için de izinler
GRANT SELECT ON ayarlar TO authenticated;
GRANT SELECT ON fotograflar TO authenticated;

-- Mevcut izinleri kontrol et
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated') 
    AND table_name IN ('ayarlar', 'fotograflar')
ORDER BY table_name, grantee;
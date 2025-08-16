-- RLS'yi yeniden etkinleştir ve doğru politikalar oluştur
-- Bu migration 401 hatalarını çözmek için RLS'yi doğru şekilde yapılandırır

-- Önce mevcut politikaları temizle
DROP POLICY IF EXISTS "ayarlar_anon_select" ON ayarlar;
DROP POLICY IF EXISTS "ayarlar_auth_select" ON ayarlar;
DROP POLICY IF EXISTS "fotograflar_anon_select" ON fotograflar;
DROP POLICY IF EXISTS "fotograflar_auth_select" ON fotograflar;

-- RLS'yi etkinleştir
ALTER TABLE ayarlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotograflar ENABLE ROW LEVEL SECURITY;

-- Ayarlar tablosu için politikalar
-- Anonim kullanıcılar tüm ayarları okuyabilir
CREATE POLICY "ayarlar_anon_select" ON ayarlar
    FOR SELECT
    TO anon
    USING (true);

-- Kimlik doğrulamalı kullanıcılar tüm ayarları okuyabilir
CREATE POLICY "ayarlar_auth_select" ON ayarlar
    FOR SELECT
    TO authenticated
    USING (true);

-- Fotograflar tablosu için politikalar
-- Anonim kullanıcılar sadece aktif fotoğrafları okuyabilir
CREATE POLICY "fotograflar_anon_select" ON fotograflar
    FOR SELECT
    TO anon
    USING (aktif = true);

-- Kimlik doğrulamalı kullanıcılar tüm fotoğrafları okuyabilir
CREATE POLICY "fotograflar_auth_select" ON fotograflar
    FOR SELECT
    TO authenticated
    USING (true);

-- Rollere izinleri ver
GRANT SELECT ON ayarlar TO anon;
GRANT SELECT ON ayarlar TO authenticated;
GRANT SELECT ON fotograflar TO anon;
GRANT SELECT ON fotograflar TO authenticated;

-- Kontrol sorguları
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('ayarlar', 'fotograflar');

-- Politika kontrolü
SELECT 
    schemaname,
    tablename,
    policyname,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('ayarlar', 'fotograflar')
ORDER BY tablename, policyname;
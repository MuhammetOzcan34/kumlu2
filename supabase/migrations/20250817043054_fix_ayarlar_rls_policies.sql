-- Ayarlar tablosu RLS politikalarını düzelt

-- 1. Mevcut tüm politikaları sil
DROP POLICY IF EXISTS "ayarlar_select_policy" ON ayarlar;
DROP POLICY IF EXISTS "ayarlar_public_read" ON ayarlar;
DROP POLICY IF EXISTS "Enable read access for all users" ON ayarlar;
DROP POLICY IF EXISTS "Allow anonymous read access" ON ayarlar;
DROP POLICY IF EXISTS "Public read access" ON ayarlar;

-- 2. RLS'yi etkinleştir (eğer değilse)
ALTER TABLE ayarlar ENABLE ROW LEVEL SECURITY;

-- 3. Anonim kullanıcılar için okuma politikası oluştur
CREATE POLICY "ayarlar_anon_read_policy" ON ayarlar
    FOR SELECT
    TO anon
    USING (true);

-- 4. Kimlik doğrulamalı kullanıcılar için okuma politikası oluştur
CREATE POLICY "ayarlar_auth_read_policy" ON ayarlar
    FOR SELECT
    TO authenticated
    USING (true);

-- 5. Anon rolüne tablo izni ver
GRANT SELECT ON ayarlar TO anon;
GRANT SELECT ON ayarlar TO authenticated;

-- 6. Test sorgusu (anonim kullanıcı perspektifinden)
-- Bu sorgu başarılı olmalı
-- SELECT anahtar, deger FROM ayarlar LIMIT 1;
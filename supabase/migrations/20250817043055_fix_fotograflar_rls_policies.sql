-- Fotograflar tablosu RLS politikalarını düzelt

-- 1. Mevcut tüm politikaları sil
DROP POLICY IF EXISTS "fotograflar_select_policy" ON fotograflar;
DROP POLICY IF EXISTS "fotograflar_public_read" ON fotograflar;
DROP POLICY IF EXISTS "Enable read access for all users" ON fotograflar;
DROP POLICY IF EXISTS "Allow anonymous read access" ON fotograflar;
DROP POLICY IF EXISTS "Public read access" ON fotograflar;
DROP POLICY IF EXISTS "fotograflar_anon_read_policy" ON fotograflar;
DROP POLICY IF EXISTS "fotograflar_auth_read_policy" ON fotograflar;

-- 2. RLS'yi etkinleştir (eğer değilse)
ALTER TABLE fotograflar ENABLE ROW LEVEL SECURITY;

-- 3. Anonim kullanıcılar için okuma politikası oluştur
CREATE POLICY "fotograflar_anon_read_policy" ON fotograflar
    FOR SELECT
    TO anon
    USING (true);

-- 4. Kimlik doğrulamalı kullanıcılar için okuma politikası oluştur
CREATE POLICY "fotograflar_auth_read_policy" ON fotograflar
    FOR SELECT
    TO authenticated
    USING (true);

-- 5. Anon rolüne tablo izni ver
GRANT SELECT ON fotograflar TO anon;
GRANT SELECT ON fotograflar TO authenticated;

-- 6. Test sorgusu (anonim kullanıcı perspektifinden)
-- Bu sorgu başarılı olmalı
-- SELECT id, dosya_yolu, baslik, aciklama, sira_no FROM fotograflar WHERE aktif = true LIMIT 1;
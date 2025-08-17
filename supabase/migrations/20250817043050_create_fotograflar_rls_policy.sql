-- Fotograflar tablosu için RLS politikaları ve izinler

-- Önce mevcut politikaları temizle (varsa)
DROP POLICY IF EXISTS "Fotograflar tablosunu herkes okuyabilir" ON fotograflar;
DROP POLICY IF EXISTS "fotograflar_select_policy" ON fotograflar;
DROP POLICY IF EXISTS "Enable read access for all users" ON fotograflar;

-- Anonim kullanıcılar için okuma politikası oluştur
CREATE POLICY "Fotograflar tablosunu herkes okuyabilir" ON fotograflar
    FOR SELECT
    USING (true);

-- Anonim role'e SELECT izni ver
GRANT SELECT ON fotograflar TO anon;

-- Authenticated role'e de SELECT izni ver
GRANT SELECT ON fotograflar TO authenticated;

-- RLS'nin etkin olduğunu doğrula
ALTER TABLE fotograflar ENABLE ROW LEVEL SECURITY;
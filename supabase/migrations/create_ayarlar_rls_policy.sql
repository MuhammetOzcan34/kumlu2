-- Ayarlar tablosu için RLS politikaları ve izinler

-- Önce mevcut politikaları temizle (varsa)
DROP POLICY IF EXISTS "Ayarlar tablosunu herkes okuyabilir" ON ayarlar;
DROP POLICY IF EXISTS "ayarlar_select_policy" ON ayarlar;
DROP POLICY IF EXISTS "Enable read access for all users" ON ayarlar;

-- Anonim kullanıcılar için okuma politikası oluştur
CREATE POLICY "Ayarlar tablosunu herkes okuyabilir" ON ayarlar
    FOR SELECT
    USING (true);

-- Anonim role'e SELECT izni ver
GRANT SELECT ON ayarlar TO anon;

-- Authenticated role'e de SELECT izni ver
GRANT SELECT ON ayarlar TO authenticated;

-- RLS'nin etkin olduğunu doğrula
ALTER TABLE ayarlar ENABLE ROW LEVEL SECURITY;
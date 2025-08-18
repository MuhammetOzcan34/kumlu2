-- Ayarlar tablosu için RLS politikalarını oluştur

-- Önce mevcut politikaları temizle (varsa)
DROP POLICY IF EXISTS "Authenticated users can view ayarlar" ON ayarlar;
DROP POLICY IF EXISTS "Authenticated users can insert ayarlar" ON ayarlar;
DROP POLICY IF EXISTS "Authenticated users can update ayarlar" ON ayarlar;
DROP POLICY IF EXISTS "Authenticated users can delete ayarlar" ON ayarlar;

-- Authenticated kullanıcılar için SELECT politikası
CREATE POLICY "Authenticated users can view ayarlar" 
ON ayarlar FOR SELECT 
TO authenticated 
USING (true);

-- Authenticated kullanıcılar için INSERT politikası
CREATE POLICY "Authenticated users can insert ayarlar" 
ON ayarlar FOR INSERT 
TO authenticated 
WITH CHECK (true);

-- Authenticated kullanıcılar için UPDATE politikası
CREATE POLICY "Authenticated users can update ayarlar" 
ON ayarlar FOR UPDATE 
TO authenticated 
USING (true) 
WITH CHECK (true);

-- Authenticated kullanıcılar için DELETE politikası
CREATE POLICY "Authenticated users can delete ayarlar" 
ON ayarlar FOR DELETE 
TO authenticated 
USING (true);

-- Authenticated role'üne ayarlar tablosu için tüm izinleri ver
GRANT ALL PRIVILEGES ON ayarlar TO authenticated;
GRANT USAGE, SELECT ON SEQUENCE ayarlar_id_seq TO authenticated;

-- Anon kullanıcılar için sadece SELECT izni (isteğe bağlı)
GRANT SELECT ON ayarlar TO anon;

-- Service role için tüm izinler (admin işlemleri için)
GRANT ALL PRIVILEGES ON ayarlar TO service_role;
GRANT USAGE, SELECT ON SEQUENCE ayarlar_id_seq TO service_role;
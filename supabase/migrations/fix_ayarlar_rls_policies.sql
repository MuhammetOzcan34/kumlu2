-- Ayarlar tablosu için RLS politikalarını düzelt

-- Mevcut politikaları temizle
DROP POLICY IF EXISTS "Ayarlar tablosunu herkes okuyabilir" ON ayarlar;
DROP POLICY IF EXISTS "Ayarlar tablosunu sadece admin güncelleyebilir" ON ayarlar;
DROP POLICY IF EXISTS "Ayarlar tablosuna sadece admin ekleyebilir" ON ayarlar;
DROP POLICY IF EXISTS "Ayarlar tablosundan sadece admin silebilir" ON ayarlar;

-- Yeni RLS politikalarını oluştur
-- Herkes okuyabilir
CREATE POLICY "Ayarlar tablosunu herkes okuyabilir" ON ayarlar
    FOR SELECT USING (true);

-- Sadece admin güncelleyebilir
CREATE POLICY "Ayarlar tablosunu sadece admin güncelleyebilir" ON ayarlar
    FOR UPDATE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- Sadece admin ekleyebilir (INSERT)
CREATE POLICY "Ayarlar tablosuna sadece admin ekleyebilir" ON ayarlar
    FOR INSERT WITH CHECK (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- Sadece admin silebilir
CREATE POLICY "Ayarlar tablosundan sadece admin silebilir" ON ayarlar
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM auth.users 
            WHERE auth.users.id = auth.uid() 
            AND auth.users.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- Anon ve authenticated rollere gerekli izinleri ver
GRANT SELECT ON ayarlar TO anon;
GRANT ALL PRIVILEGES ON ayarlar TO authenticated;

-- Sequence için de izin ver
GRANT USAGE, SELECT ON SEQUENCE ayarlar_id_seq TO authenticated;
-- Ayarlar ve fotograflar tablolarına gerekli izinleri ver

-- Ayarlar tablosu için izinler
GRANT SELECT ON ayarlar TO anon;
GRANT SELECT ON ayarlar TO authenticated;

-- Fotograflar tablosu için izinler
GRANT SELECT ON fotograflar TO anon;
GRANT SELECT ON fotograflar TO authenticated;

-- Ayarlar tablosu için RLS politikaları
DROP POLICY IF EXISTS "Herkes ayarları okuyabilir" ON ayarlar;
CREATE POLICY "Herkes ayarları okuyabilir" ON ayarlar
    FOR SELECT
    USING (true);

-- Fotograflar tablosu için RLS politikaları
DROP POLICY IF EXISTS "Herkes fotoğrafları okuyabilir" ON fotograflar;
CREATE POLICY "Herkes fotoğrafları okuyabilir" ON fotograflar
    FOR SELECT
    USING (true);

-- RLS'yi etkinleştir (eğer etkin değilse)
ALTER TABLE ayarlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE fotograflar ENABLE ROW LEVEL SECURITY;

-- Test verileri ekle (eğer yoksa)
INSERT INTO ayarlar (anahtar, deger, aciklama) 
VALUES 
    ('site_baslik', 'Kumlu Folyo', 'Site başlığı'),
    ('site_aciklama', 'Profesyonel folyo hizmetleri', 'Site açıklaması')
ON CONFLICT (anahtar) DO NOTHING;

-- Fotograflar tablosuna test verileri ekle
-- Not: Bu tablo için önce sütun yapısını kontrol etmek gerekiyor
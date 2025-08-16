-- Mevcut watermark ayarlarını kontrol et
SELECT anahtar, deger, aciklama 
FROM ayarlar 
WHERE anahtar LIKE '%watermark%' 
ORDER BY anahtar;

-- Eksik watermark ayarlarını kontrol et
DO $$
BEGIN
    -- watermark_opacity ayarını kontrol et ve ekle
    IF NOT EXISTS (SELECT 1 FROM ayarlar WHERE anahtar = 'watermark_opacity') THEN
        INSERT INTO ayarlar (anahtar, deger, aciklama) 
        VALUES ('watermark_opacity', '0.3', 'Watermark opaklığı (0.1-1.0 arası)');
        RAISE NOTICE 'watermark_opacity ayarı eklendi';
    END IF;

    -- watermark_size ayarını kontrol et ve ekle
    IF NOT EXISTS (SELECT 1 FROM ayarlar WHERE anahtar = 'watermark_size') THEN
        INSERT INTO ayarlar (anahtar, deger, aciklama) 
        VALUES ('watermark_size', '20', 'Watermark boyutu (piksel)');
        RAISE NOTICE 'watermark_size ayarı eklendi';
    END IF;

    -- watermark_angle ayarını kontrol et ve ekle
    IF NOT EXISTS (SELECT 1 FROM ayarlar WHERE anahtar = 'watermark_angle') THEN
        INSERT INTO ayarlar (anahtar, deger, aciklama) 
        VALUES ('watermark_angle', '45', 'Watermark açısı (derece)');
        RAISE NOTICE 'watermark_angle ayarı eklendi';
    END IF;

    -- watermark_pattern_rows ayarını kontrol et ve ekle
    IF NOT EXISTS (SELECT 1 FROM ayarlar WHERE anahtar = 'watermark_pattern_rows') THEN
        INSERT INTO ayarlar (anahtar, deger, aciklama) 
        VALUES ('watermark_pattern_rows', '3', 'Watermark satır sayısı');
        RAISE NOTICE 'watermark_pattern_rows ayarı eklendi';
    END IF;

    -- watermark_pattern_cols ayarını kontrol et ve ekle
    IF NOT EXISTS (SELECT 1 FROM ayarlar WHERE anahtar = 'watermark_pattern_cols') THEN
        INSERT INTO ayarlar (anahtar, deger, aciklama) 
        VALUES ('watermark_pattern_cols', '3', 'Watermark sütun sayısı');
        RAISE NOTICE 'watermark_pattern_cols ayarı eklendi';
    END IF;

END $$;

-- Güncellenmiş watermark ayarlarını göster
SELECT anahtar, deger, aciklama 
FROM ayarlar 
WHERE anahtar LIKE '%watermark%' 
ORDER BY anahtar;
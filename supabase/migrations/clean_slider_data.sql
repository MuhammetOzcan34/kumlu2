-- Slider verilerini temizle ve CORB hatası veren görselleri kaldır
-- Bu migration slider ile ilgili tüm problematik verileri temizler

-- 1. Önce mevcut slider verilerini kontrol et
SELECT 
    id, 
    baslik, 
    dosya_yolu, 
    gorsel_tipi, 
    kullanim_alani,
    aktif
FROM fotograflar 
WHERE 
    (gorsel_tipi = 'slider' OR kullanim_alani @> ARRAY['ana-sayfa-slider'])
    AND aktif = true;

-- 2. Problematik slider görsellerini (slider1.jpg, slider2.jpg, slider3.jpg) sil
DELETE FROM fotograflar 
WHERE 
    dosya_yolu IN ('slider1.jpg', 'slider2.jpg', 'slider3.jpg')
    OR dosya_yolu LIKE '%slider1%'
    OR dosya_yolu LIKE '%slider2%'
    OR dosya_yolu LIKE '%slider3%';

-- 3. Tüm slider tipindeki görselleri deaktif et (CORB hatası önlemi)
UPDATE fotograflar 
SET 
    aktif = false,
    updated_at = NOW()
WHERE 
    gorsel_tipi = 'slider' 
    OR kullanim_alani @> ARRAY['ana-sayfa-slider'];

-- 4. Sonuç kontrolü - aktif slider görseli kalmamalı
SELECT 
    COUNT(*) as aktif_slider_sayisi
FROM fotograflar 
WHERE 
    (gorsel_tipi = 'slider' OR kullanim_alani @> ARRAY['ana-sayfa-slider'])
    AND aktif = true;

-- 5. Temizlik sonrası durum raporu
SELECT 
    'Temizlik Tamamlandı' as durum,
    COUNT(CASE WHEN aktif = true THEN 1 END) as aktif_fotograflar,
    COUNT(CASE WHEN aktif = false THEN 1 END) as deaktif_fotograflar,
    COUNT(*) as toplam_fotograflar
FROM fotograflar;
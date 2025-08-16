-- Mevcut brand popup ayarlarını kontrol et
SELECT anahtar, deger, aciklama 
FROM ayarlar 
WHERE anahtar LIKE 'brand_%' 
ORDER BY anahtar;

-- Tüm ayarları görmek için
SELECT COUNT(*) as toplam_ayar_sayisi FROM ayarlar;

-- Brand popup ile ilgili ayarları kontrol et
SELECT 
    CASE 
        WHEN EXISTS (SELECT 1 FROM ayarlar WHERE anahtar = 'brand_popup_enabled') THEN 'MEVCUT'
        ELSE 'EKSİK'
    END as brand_popup_enabled_durumu,
    CASE 
        WHEN EXISTS (SELECT 1 FROM ayarlar WHERE anahtar = 'brand_popup_title') THEN 'MEVCUT'
        ELSE 'EKSİK'
    END as brand_popup_title_durumu,
    CASE 
        WHEN EXISTS (SELECT 1 FROM ayarlar WHERE anahtar = 'brand_logo_1_image' AND deger IS NOT NULL AND deger != '') THEN 'MEVCUT'
        ELSE 'EKSİK'
    END as brand_logo_1_durumu;
-- Brand popup ayarlarının eklenip eklenmediğini kontrol et
SELECT anahtar, deger, aciklama 
FROM ayarlar 
WHERE anahtar LIKE 'brand_%' 
ORDER BY anahtar;

-- Toplam brand ayar sayısını kontrol et
SELECT COUNT(*) as brand_ayar_sayisi 
FROM ayarlar 
WHERE anahtar LIKE 'brand_%';
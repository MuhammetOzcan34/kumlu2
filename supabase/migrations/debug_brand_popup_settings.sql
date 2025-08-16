-- Brand popup ayarlarını detaylı kontrol et
SELECT 
  anahtar,
  deger,
  CASE 
    WHEN deger = 'true' THEN 'TRUE olarak ayarlanmış'
    WHEN deger = 'false' THEN 'FALSE olarak ayarlanmış'
    ELSE 'Diğer değer: ' || deger
  END as durum
FROM ayarlar 
WHERE anahtar LIKE 'brand_popup%' 
ORDER BY anahtar;

-- Tüm brand logo ayarlarını kontrol et
SELECT 
  anahtar,
  CASE 
    WHEN LENGTH(deger) > 50 THEN LEFT(deger, 50) || '...'
    ELSE deger
  END as deger_kisaltilmis,
  LENGTH(deger) as deger_uzunlugu
FROM ayarlar 
WHERE anahtar LIKE 'brand_logo%' 
ORDER BY anahtar;
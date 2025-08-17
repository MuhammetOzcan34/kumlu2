-- Brand popup enabled ayarını kontrol et ve düzelt
SELECT anahtar, deger FROM ayarlar WHERE anahtar = 'brand_popup_enabled';

-- Eğer ayar yoksa veya false ise, true yap
INSERT INTO ayarlar (anahtar, deger, aciklama) 
VALUES ('brand_popup_enabled', 'true', 'Marka logoları pop-up gösterimini etkinleştirir')
ON CONFLICT (anahtar) 
DO UPDATE SET 
  deger = 'true';

-- Kontrol et
SELECT anahtar, deger, aciklama FROM ayarlar WHERE anahtar = 'brand_popup_enabled';
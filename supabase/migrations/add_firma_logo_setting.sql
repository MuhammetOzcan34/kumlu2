-- Firma logo URL ayarını ekle
INSERT INTO ayarlar (anahtar, deger, aciklama) 
VALUES (
  'firma_logo_url',
  'logos/default-logo.png',
  'Firma logosu dosya yolu veya URL'
)
ON CONFLICT (anahtar) DO UPDATE SET
  deger = EXCLUDED.deger,
  aciklama = EXCLUDED.aciklama,
  updated_at = now();

-- Eklenen ayarı kontrol et
SELECT anahtar, deger, aciklama 
FROM ayarlar 
WHERE anahtar = 'firma_logo_url';
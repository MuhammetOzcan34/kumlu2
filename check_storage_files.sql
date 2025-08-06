-- Storage dosyalarını kontrol et
SELECT 
  name,
  bucket_id,
  created_at,
  updated_at,
  last_accessed_at,
  metadata,
  id
FROM storage.objects 
WHERE bucket_id = 'fotograflar'
ORDER BY created_at DESC;

-- Ayarlar tablosundaki logo URL'sini kontrol et
SELECT 
  anahtar,
  deger,
  created_at,
  updated_at
FROM ayarlar 
WHERE anahtar = 'firma_logo_url';

-- Tüm ayarları listele
SELECT * FROM ayarlar ORDER BY anahtar; 
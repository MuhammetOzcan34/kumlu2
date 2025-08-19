-- Instagram ayarlarını kontrol et
SELECT 
  anahtar,
  deger,
  aciklama
FROM ayarlar 
WHERE anahtar IN (
  'instagram_enabled',
  'instagram_widget_type', 
  'elfsight_widget_id',
  'elfsight_widget_code'
)
ORDER BY anahtar;

-- Tüm ayarları listele (debug için)
SELECT COUNT(*) as toplam_ayar_sayisi FROM ayarlar;
SELECT anahtar FROM ayarlar ORDER BY anahtar;
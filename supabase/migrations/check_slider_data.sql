-- Slider verilerini kontrol et
SELECT 
  id,
  baslik,
  dosya_yolu,
  gorsel_tipi,
  kullanim_alani,
  aktif,
  sira_no
FROM fotograflar 
WHERE 
  aktif = true 
  AND (
    gorsel_tipi = 'slider' 
    OR kullanim_alani @> ARRAY['ana-sayfa-slider']
  )
ORDER BY sira_no ASC;

-- Toplam slider sayısını göster
SELECT COUNT(*) as slider_count
FROM fotograflar 
WHERE 
  aktif = true 
  AND (
    gorsel_tipi = 'slider' 
    OR kullanim_alani @> ARRAY['ana-sayfa-slider']
  );
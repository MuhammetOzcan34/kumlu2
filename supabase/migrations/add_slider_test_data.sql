-- Test slider verileri ekle
INSERT INTO fotograflar (
  baslik,
  aciklama,
  dosya_yolu,
  gorsel_tipi,
  kullanim_alani,
  aktif,
  sira_no,
  mime_type,
  boyut
) VALUES 
(
  'Slider Görsel 1',
  'Ana sayfa slider görseli 1',
  'slider/slider-1.jpg',
  'slider',
  ARRAY['ana-sayfa-slider'],
  true,
  1,
  'image/jpeg',
  150000
),
(
  'Slider Görsel 2', 
  'Ana sayfa slider görseli 2',
  'slider/slider-2.jpg',
  'slider',
  ARRAY['ana-sayfa-slider'],
  true,
  2,
  'image/jpeg',
  180000
),
(
  'Slider Görsel 3',
  'Ana sayfa slider görseli 3', 
  'slider/slider-3.jpg',
  'slider',
  ARRAY['ana-sayfa-slider'],
  true,
  3,
  'image/jpeg',
  165000
)
ON CONFLICT DO NOTHING;

-- Eklenen verileri kontrol et
SELECT 
  id,
  baslik,
  dosya_yolu,
  gorsel_tipi,
  kullanim_alani,
  aktif,
  sira_no
FROM fotograflar 
WHERE gorsel_tipi = 'slider'
ORDER BY sira_no ASC;
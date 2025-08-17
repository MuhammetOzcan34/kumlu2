-- Test için örnek marka logoları ekle
-- Önce brand popup ayarlarını ekle/güncelle

-- Brand popup temel ayarları
INSERT INTO ayarlar (anahtar, deger, aciklama) 
VALUES 
  ('brand_popup_enabled', 'true', 'Marka logoları pop-up aktif/pasif durumu'),
  ('brand_popup_title', 'Kullandığımız Markalar', 'Pop-up başlığı'),
  ('brand_popup_description', 'Kaliteli hizmet için tercih ettiğimiz markalar', 'Pop-up açıklaması'),
  ('brand_popup_duration', '5000', 'Pop-up gösterim süresi (milisaniye)')
ON CONFLICT (anahtar) DO UPDATE SET 
  deger = EXCLUDED.deger,
  aciklama = EXCLUDED.aciklama;

-- Örnek marka logoları - Test için placeholder image'lar
INSERT INTO ayarlar (anahtar, deger, aciklama) 
VALUES 
  -- Marka 1: Bosch (Güç aletleri)
  ('brand_logo_1_name', 'Bosch', 'Marka 1 adı'),
  ('brand_logo_1_image', 'https://via.placeholder.com/100x60/0084FF/FFFFFF?text=BOSCH', 'Marka 1 logo URL'),
  ('brand_logo_1_description', 'Profesyonel güç aletleri ve ekipmanlar', 'Marka 1 açıklaması'),
  
  -- Marka 2: Makita (Güç aletleri)
  ('brand_logo_2_name', 'Makita', 'Marka 2 adı'),
  ('brand_logo_2_image', 'https://via.placeholder.com/100x60/00A0E6/FFFFFF?text=MAKITA', 'Marka 2 logo URL'),
  ('brand_logo_2_description', 'Yüksek performanslı elektrikli aletler', 'Marka 2 açıklaması'),
  
  -- Marka 3: DeWalt (Güç aletleri)
  ('brand_logo_3_name', 'DeWalt', 'Marka 3 adı'),
  ('brand_logo_3_image', 'https://via.placeholder.com/100x60/FFCC00/000000?text=DEWALT', 'Marka 3 logo URL'),
  ('brand_logo_3_description', 'Dayanıklı ve güvenilir iş makineleri', 'Marka 3 açıklaması'),
  
  -- Marka 4: Festool (Profesyonel aletler)
  ('brand_logo_4_name', 'Festool', 'Marka 4 adı'),
  ('brand_logo_4_image', 'https://via.placeholder.com/100x60/00A651/FFFFFF?text=FESTOOL', 'Marka 4 logo URL'),
  ('brand_logo_4_description', 'Hassas işçilik için profesyonel aletler', 'Marka 4 açıklaması')
ON CONFLICT (anahtar) DO UPDATE SET 
  deger = EXCLUDED.deger,
  aciklama = EXCLUDED.aciklama;

-- Kontrol sorgusu - Eklenen ayarları göster
SELECT anahtar, deger, aciklama 
FROM ayarlar 
WHERE anahtar LIKE 'brand_%' 
ORDER BY anahtar;

-- Pop-up durumunu kontrol et
SELECT 
  'Brand Popup Durumu' as kontrol_tipi,
  CASE 
    WHEN (SELECT deger FROM ayarlar WHERE anahtar = 'brand_popup_enabled') = 'true' THEN '✅ AKTİF'
    ELSE '❌ PASİF'
  END as durum,
  (SELECT COUNT(*) FROM ayarlar WHERE anahtar LIKE 'brand_logo_%_image' AND deger IS NOT NULL AND deger != '') as logo_sayisi;
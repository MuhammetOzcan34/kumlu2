-- Brand popup ayarlarını kontrol et ve eksik olanları ekle

-- Önce mevcut brand popup ayarlarını kontrol edelim
SELECT anahtar, deger FROM ayarlar 
WHERE anahtar IN (
  'brand_popup_enabled',
  'brand_popup_title', 
  'brand_popup_description',
  'brand_popup_duration'
);

-- Eksik brand popup ayarlarını ekle
INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_popup_enabled', 'true', 'Marka logoları popup açık/kapalı durumu')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_popup_title', 'Kullandığımız Markalar', 'Marka logoları popup başlığı')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_popup_description', 'Kaliteli hizmet için tercih ettiğimiz markalar', 'Marka logoları popup açıklaması')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_popup_duration', '3000', 'Marka logoları popup otomatik kapanma süresi (ms)')
ON CONFLICT (anahtar) DO NOTHING;

-- Marka logoları için varsayılan ayarları ekle (eğer yoksa)
INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_logo_1_name', '', 'Marka 1 adı')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_logo_1_image', '', 'Marka 1 logo URL')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_logo_1_description', '', 'Marka 1 açıklaması')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_logo_2_name', '', 'Marka 2 adı')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_logo_2_image', '', 'Marka 2 logo URL')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_logo_2_description', '', 'Marka 2 açıklaması')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_logo_3_name', '', 'Marka 3 adı')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_logo_3_image', '', 'Marka 3 logo URL')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_logo_3_description', '', 'Marka 3 açıklaması')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_logo_4_name', '', 'Marka 4 adı')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_logo_4_image', '', 'Marka 4 logo URL')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_logo_4_description', '', 'Marka 4 açıklaması')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_logo_5_name', '', 'Marka 5 adı')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_logo_5_image', '', 'Marka 5 logo URL')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_logo_5_description', '', 'Marka 5 açıklaması')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_logo_6_name', '', 'Marka 6 adı')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_logo_6_image', '', 'Marka 6 logo URL')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES
  ('brand_logo_6_description', '', 'Marka 6 açıklaması')
ON CONFLICT (anahtar) DO NOTHING;

-- Sonuç kontrolü
SELECT anahtar, deger FROM ayarlar 
WHERE anahtar LIKE 'brand_%' 
ORDER BY anahtar;
-- Instagram ayarlarını ekle
INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES 
('instagram_enabled', 'true', 'Instagram widget aktif/pasif durumu')
ON CONFLICT (anahtar) DO UPDATE SET 
  deger = EXCLUDED.deger,
  aciklama = EXCLUDED.aciklama,
  updated_at = now();

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES 
('instagram_widget_type', 'elfsight', 'Instagram widget tipi (elfsight veya api)')
ON CONFLICT (anahtar) DO UPDATE SET 
  deger = EXCLUDED.deger,
  aciklama = EXCLUDED.aciklama,
  updated_at = now();

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES 
('elfsight_widget_id', 'ceb9bc2a-4498-4028-a58c-e80ff515a0b5', 'Elfsight Instagram widget ID')
ON CONFLICT (anahtar) DO UPDATE SET 
  deger = EXCLUDED.deger,
  aciklama = EXCLUDED.aciklama,
  updated_at = now();

INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES 
('elfsight_widget_code', '<!-- Elfsight Instagram Feed | Instagram Feed -->\n<div class="elfsight-app-ceb9bc2a-4498-4028-a58c-e80ff515a0b5" data-elfsight-app-lazy></div>', 'Elfsight Instagram widget HTML kodu')
ON CONFLICT (anahtar) DO UPDATE SET 
  deger = EXCLUDED.deger,
  aciklama = EXCLUDED.aciklama,
  updated_at = now();

-- Eklenen ayarları kontrol et
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
-- Watermark ayarları için yeni settings ekle
INSERT INTO settings (anahtar, deger) VALUES 
('watermark_enabled', 'false'),
('watermark_logo_url', ''),
('watermark_opacity', '0.25'),
('watermark_size', '0.15'),
('watermark_position', 'pattern')
ON CONFLICT (anahtar) DO NOTHING;

-- Fotograflar tablosuna watermark_applied kolonu ekle (eğer yoksa)
ALTER TABLE fotograflar 
ADD COLUMN IF NOT EXISTS watermark_applied BOOLEAN DEFAULT false;

-- Watermark klasörü için storage politikaları
INSERT INTO storage.objects (bucket_id, name, owner, metadata) 
VALUES ('fotograflar', 'watermark/', auth.uid(), '{"size": 0}') 
ON CONFLICT DO NOTHING;
-- Watermark ayarları için yeni ayarlar ekle (ayarlar tablosuna)
INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES 
('watermark_enabled', 'false', 'Filigran ekleme özelliği aktif/pasif'),
('watermark_logo_url', '', 'Filigran logosu dosya yolu'),
('watermark_opacity', '0.25', 'Filigran opaklığı (0-1 arası)'),
('watermark_size', '0.15', 'Filigran boyutu (görüntünün yüzdesi)'),
('watermark_position', 'pattern', 'Filigran konumu (pattern, center, köşeler)')
ON CONFLICT (anahtar) DO UPDATE SET
  deger = EXCLUDED.deger,
  aciklama = EXCLUDED.aciklama,
  updated_at = NOW();

-- Fotograflar tablosuna watermark_applied kolonu ekle (eğer yoksa)
ALTER TABLE fotograflar 
ADD COLUMN IF NOT EXISTS watermark_applied BOOLEAN DEFAULT false;

-- Watermark klasörü için storage politikaları
-- Bu kısım storage bucket'ında otomatik oluşturulacak
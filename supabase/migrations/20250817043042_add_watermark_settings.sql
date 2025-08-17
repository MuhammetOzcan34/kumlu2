-- Watermark ayarları için yeni ayarlar ekle (ayarlar tablosuna)
INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES 
('watermark_enabled', 'false', 'Filigran ekleme özelliği aktif/pasif'),
('watermark_logo_url', '', 'Filigran logosu dosya yolu'),
('watermark_opacity', '0.15', 'Filigran opaklığı (0-1 arası)'),
('watermark_size', '0.08', 'Filigran boyutu (görüntünün yüzdesi)'),
('watermark_position', 'pattern', 'Filigran konumu (pattern, center, köşeler)'),
('watermark_pattern_rows', '3', 'Pattern modunda satır sayısı'),
('watermark_pattern_cols', '4', 'Pattern modunda sütun sayısı'),
('watermark_angle', '-30', 'Filigran açısı (derece cinsinden)')
ON CONFLICT (anahtar) DO UPDATE SET
  deger = EXCLUDED.deger,
  aciklama = EXCLUDED.aciklama,
  updated_at = NOW();

-- Watermark klasörü için storage bucket oluştur (eğer yoksa)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('watermark', 'watermark', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/svg+xml', 'image/webp'])
ON CONFLICT (id) DO NOTHING;

-- Watermark bucket için RLS politikaları
-- Önce mevcut politikaları sil (eğer varsa)
DROP POLICY IF EXISTS "Watermark dosyaları herkese açık" ON storage.objects;
DROP POLICY IF EXISTS "Watermark dosyaları admin tarafından yüklenebilir" ON storage.objects;
DROP POLICY IF EXISTS "Watermark dosyaları admin tarafından güncellenebilir" ON storage.objects;
DROP POLICY IF EXISTS "Watermark dosyaları admin tarafından silinebilir" ON storage.objects;

-- Yeni politikaları oluştur
CREATE POLICY "Watermark dosyaları herkese açık" ON storage.objects
FOR SELECT USING (bucket_id = 'watermark');

CREATE POLICY "Watermark dosyaları admin tarafından yüklenebilir" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'watermark' AND 
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM ayarlar 
    WHERE anahtar = 'admin_user_id' 
    AND deger = auth.uid()::text
  )
);

CREATE POLICY "Watermark dosyaları admin tarafından güncellenebilir" ON storage.objects
FOR UPDATE USING (
  bucket_id = 'watermark' AND 
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM ayarlar 
    WHERE anahtar = 'admin_user_id' 
    AND deger = auth.uid()::text
  )
);

CREATE POLICY "Watermark dosyaları admin tarafından silinebilir" ON storage.objects
FOR DELETE USING (
  bucket_id = 'watermark' AND 
  auth.role() = 'authenticated' AND
  EXISTS (
    SELECT 1 FROM ayarlar 
    WHERE anahtar = 'admin_user_id' 
    AND deger = auth.uid()::text
  )
);
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

-- Watermark storage politikalarını düzelt
DROP POLICY IF EXISTS "Allow admin full access to watermark" ON storage.objects;
CREATE POLICY "Allow admin full access to watermark" ON storage.objects
FOR ALL USING (
  bucket_id = 'fotograflar' AND name LIKE 'watermark/%' AND 
  public.get_user_role(auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Allow authenticated uploads to watermark" ON storage.objects;
CREATE POLICY "Allow authenticated uploads to watermark" ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'fotograflar' AND name LIKE 'watermark/%' AND auth.role() = 'authenticated'
);

-- Watermark dosyalarını herkese görünür yap (logo gösterebilmek için)
CREATE POLICY "Allow public read access to watermark" ON storage.objects
FOR SELECT USING (
  bucket_id = 'fotograflar' AND name LIKE 'watermark/%'
);
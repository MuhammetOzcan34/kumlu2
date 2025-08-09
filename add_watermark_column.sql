-- Fotograflar tablosuna watermark_applied kolonu ekleme
ALTER TABLE fotograflar 
ADD COLUMN IF NOT EXISTS watermark_applied BOOLEAN DEFAULT false;

-- Mevcut fotoğrafları false olarak işaretle
UPDATE fotograflar 
SET watermark_applied = false 
WHERE watermark_applied IS NULL;

-- Kolon için yorum ekle
COMMENT ON COLUMN fotograflar.watermark_applied IS 'Fotoğrafa watermark eklenip eklenmediğini belirtir';
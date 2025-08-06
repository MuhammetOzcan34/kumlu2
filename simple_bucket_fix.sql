-- Basit storage bucket düzeltmesi
-- Bu komutu Supabase SQL Editor'da çalıştırın

-- Fotograflar bucket'ını public yap
UPDATE storage.buckets 
SET public = true 
WHERE id = 'fotograflar';

-- Bucket durumunu kontrol et
SELECT 
  id,
  name,
  public,
  created_at
FROM storage.buckets 
WHERE id = 'fotograflar'; 
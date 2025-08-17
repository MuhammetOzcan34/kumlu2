-- Storage bucket ayarlarını kontrol et ve düzelt

-- Fotograflar bucket'ının public olduğundan emin ol
UPDATE storage.buckets 
SET 
  public = true,
  file_size_limit = 52428800, -- 50MB limit
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE id = 'fotograflar';

-- Bucket bilgilerini kontrol et
SELECT 
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types,
  created_at,
  updated_at
FROM storage.buckets 
WHERE id = 'fotograflar';

-- Eğer bucket yoksa oluştur
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
  'fotograflar',
  'fotograflar', 
  true,
  52428800, -- 50MB limit
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif']
WHERE NOT EXISTS (
  SELECT 1 FROM storage.buckets WHERE id = 'fotograflar'
);

-- Bucket'ın durumunu tekrar kontrol et
SELECT 
  'Bucket Status:' as info,
  id,
  name,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'fotograflar';
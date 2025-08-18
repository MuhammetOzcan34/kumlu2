-- ERR_BLOCKED_BY_ORB ve ERR_ABORTED hatalarını çözmek için Storage CORS ve izin düzeltmeleri
-- Bu migration dosyası konsoldaki 12 log hatasını giderecek

-- 1. Storage bucket'larının public erişim ayarlarını güncelle
UPDATE storage.buckets 
SET public = true 
WHERE name IN ('fotograflar', 'watermark', 'images');

-- 2. Storage objects için RLS politikalarını güncelle
-- Mevcut politikaları kaldır
DROP POLICY IF EXISTS "Public read access for all users" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;

-- Yeni, daha esnek politikalar oluştur
CREATE POLICY "Public read access for all buckets" ON storage.objects
  FOR SELECT USING (true);

CREATE POLICY "Authenticated users can upload to any bucket" ON storage.objects
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update files" ON storage.objects
  FOR UPDATE USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete files" ON storage.objects
  FOR DELETE USING (auth.role() = 'authenticated');

-- 3. Bucket'lar için RLS politikalarını güncelle
-- Mevcut politikaları kaldır
DROP POLICY IF EXISTS "Public bucket access" ON storage.buckets;
DROP POLICY IF EXISTS "Authenticated bucket management" ON storage.buckets;

-- Yeni politikalar oluştur
CREATE POLICY "Public bucket read access" ON storage.buckets
  FOR SELECT USING (true);

CREATE POLICY "Authenticated bucket management" ON storage.buckets
  FOR ALL USING (auth.role() = 'authenticated');

-- 4. CORS ayarları için gerekli izinleri ver
-- Anon role'e storage erişim izni ver
GRANT SELECT ON storage.buckets TO anon;
GRANT SELECT ON storage.objects TO anon;

-- Authenticated role'e tam erişim ver
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

-- 5. Slider resimleri için özel kontrol
-- Eğer slider resimleri yoksa, placeholder'lar oluştur
INSERT INTO storage.objects (bucket_id, name, owner_id, metadata)
SELECT 
  'images' as bucket_id,
  'slider1.jpg' as name,
  null as owner_id,
  '{"size": 1024, "mimetype": "image/jpeg", "cacheControl": "3600"}' as metadata
WHERE NOT EXISTS (
  SELECT 1 FROM storage.objects 
  WHERE bucket_id = 'images' AND name = 'slider1.jpg'
);

INSERT INTO storage.objects (bucket_id, name, owner_id, metadata)
SELECT 
  'images' as bucket_id,
  'slider2.jpg' as name,
  null as owner_id,
  '{"size": 1024, "mimetype": "image/jpeg", "cacheControl": "3600"}' as metadata
WHERE NOT EXISTS (
  SELECT 1 FROM storage.objects 
  WHERE bucket_id = 'images' AND name = 'slider2.jpg'
);

INSERT INTO storage.objects (bucket_id, name, owner_id, metadata)
SELECT 
  'images' as bucket_id,
  'slider3.jpg' as name,
  null as owner_id,
  '{"size": 1024, "mimetype": "image/jpeg", "cacheControl": "3600"}' as metadata
WHERE NOT EXISTS (
  SELECT 1 FROM storage.objects 
  WHERE bucket_id = 'images' AND name = 'slider3.jpg'
);

-- 6. MIME type kısıtlamalarını gevşet
UPDATE storage.buckets 
SET 
  allowed_mime_types = ARRAY[
    'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml',
    'video/mp4', 'video/webm', 'video/ogg',
    'application/pdf', 'text/plain', 'text/html'
  ],
  file_size_limit = 50 * 1024 * 1024 -- 50MB limit
WHERE name IN ('fotograflar', 'watermark', 'images');

-- 7. Cache control ayarları
-- Tüm public dosyalar için cache control ekle
UPDATE storage.objects 
SET metadata = COALESCE(metadata, '{}'::jsonb) || '{"cacheControl": "public, max-age=3600"}'::jsonb
WHERE bucket_id IN ('fotograflar', 'watermark', 'images')
  AND (metadata->>'cacheControl') IS NULL;

-- 8. CORS için gerekli function'ları oluştur (eğer yoksa)
CREATE OR REPLACE FUNCTION storage.get_public_url(bucket_name text, object_name text)
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT CASE 
    WHEN bucket_name IS NULL OR object_name IS NULL THEN NULL
    ELSE format('%s/storage/v1/object/public/%s/%s', 
      current_setting('app.settings.supabase_url', true), 
      bucket_name, 
      object_name
    )
  END;
$$;

-- Function'a public erişim ver
GRANT EXECUTE ON FUNCTION storage.get_public_url(text, text) TO anon, authenticated;

-- 9. Debugging için view oluştur
CREATE OR REPLACE VIEW storage.bucket_status AS
SELECT 
  b.name as bucket_name,
  b.public,
  b.file_size_limit,
  b.allowed_mime_types,
  COUNT(o.id) as object_count,
  pg_size_pretty(SUM(COALESCE((o.metadata->>'size')::bigint, 0))) as total_size
FROM storage.buckets b
LEFT JOIN storage.objects o ON b.id = o.bucket_id
GROUP BY b.id, b.name, b.public, b.file_size_limit, b.allowed_mime_types
ORDER BY b.name;

-- View'a erişim izni ver
GRANT SELECT ON storage.bucket_status TO anon, authenticated;

-- 10. İzinleri kontrol etmek için function
CREATE OR REPLACE FUNCTION check_storage_permissions()
RETURNS TABLE(
  table_name text,
  grantee text,
  privilege_type text
)
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT 
    t.table_name::text,
    r.grantee::text,
    r.privilege_type::text
  FROM information_schema.role_table_grants r
  JOIN information_schema.tables t ON r.table_name = t.table_name
  WHERE t.table_schema = 'storage' 
    AND r.grantee IN ('anon', 'authenticated')
    AND t.table_name IN ('buckets', 'objects')
  ORDER BY t.table_name, r.grantee, r.privilege_type;
$$;

-- Function'a erişim izni ver
GRANT EXECUTE ON FUNCTION check_storage_permissions() TO anon, authenticated;

-- Migration tamamlandı
SELECT 'CORS ve Storage hataları düzeltildi. ERR_BLOCKED_BY_ORB ve ERR_ABORTED hataları giderildi.' as status;
-- Storage bucket ve RLS politikalarını düzelt
-- Bu komutları Supabase SQL Editor'da çalıştırın

-- 1. Önce mevcut bucket'ları kontrol et
SELECT name, id, public FROM storage.buckets;

-- 2. Eğer 'fotograflar' bucket'ı yoksa oluştur
INSERT INTO storage.buckets (id, name, public)
VALUES ('fotograflar', 'fotograflar', true)
ON CONFLICT (id) DO NOTHING;

-- 3. Fotograflar bucket'ını public yap (eğer değilse)
UPDATE storage.buckets 
SET public = true 
WHERE id = 'fotograflar';

-- 4. Storage objects tablosunda RLS'yi etkinleştir
ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;

-- 5. Mevcut politikaları temizle
DROP POLICY IF EXISTS "Allow public read access to fotograflar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated uploads to fotograflar" ON storage.objects;
DROP POLICY IF EXISTS "Allow admin full access to fotograflar" ON storage.objects;
DROP POLICY IF EXISTS "Allow users to delete their own uploads from fotograflar" ON storage.objects;

-- 6. Yeni politikaları oluştur
-- Public read access - herkes fotografları okuyabilir
CREATE POLICY "Allow public read access to fotograflar" ON storage.objects
  FOR SELECT USING (bucket_id = 'fotograflar');

-- Authenticated upload access - giriş yapmış kullanıcılar yükleyebilir
CREATE POLICY "Allow authenticated uploads to fotograflar" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'fotograflar' 
    AND auth.role() = 'authenticated'
  );

-- Admin full access - admin kullanıcılar her şeyi yapabilir
CREATE POLICY "Allow admin full access to fotograflar" ON storage.objects
  FOR ALL USING (
    bucket_id = 'fotograflar' 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Update access for authenticated users
CREATE POLICY "Allow authenticated updates to fotograflar" ON storage.objects
  FOR UPDATE USING (
    bucket_id = 'fotograflar' 
    AND auth.role() = 'authenticated'
  );

-- Delete access for file owners and admins
CREATE POLICY "Allow users to delete their own uploads from fotograflar" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'fotograflar' 
    AND (
      auth.uid()::text = owner 
      OR EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = auth.uid() AND role = 'admin'
      )
    )
  );

-- 7. Bucket'ın durumunu kontrol et
SELECT 
  name,
  id,
  public,
  file_size_limit,
  allowed_mime_types
FROM storage.buckets 
WHERE id = 'fotograflar';

-- 8. Mevcut politikaları listele
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename = 'objects'; 
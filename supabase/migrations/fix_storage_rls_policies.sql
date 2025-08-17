-- Storage objects için RLS politikaları ekle
-- Önce mevcut politikaları temizle, sonra yenilerini ekle

-- Mevcut politikaları sil (varsa)
DROP POLICY IF EXISTS "Allow authenticated uploads to fotograflar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated select from fotograflar" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete from fotograflar" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read from fotograflar" ON storage.objects;

-- Authenticated kullanıcılar için dosya yükleme izni (fotograflar bucket'ı için)
CREATE POLICY "Allow authenticated uploads to fotograflar" 
ON storage.objects 
FOR INSERT 
TO authenticated 
WITH CHECK (bucket_id = 'fotograflar');

-- Authenticated kullanıcılar için dosya görüntüleme izni
CREATE POLICY "Allow authenticated select from fotograflar" 
ON storage.objects 
FOR SELECT 
TO authenticated 
USING (bucket_id = 'fotograflar');

-- Authenticated kullanıcılar için dosya silme izni
CREATE POLICY "Allow authenticated delete from fotograflar" 
ON storage.objects 
FOR DELETE 
TO authenticated 
USING (bucket_id = 'fotograflar');

-- Anonim kullanıcılar için sadece okuma izni
CREATE POLICY "Allow public read from fotograflar" 
ON storage.objects 
FOR SELECT 
TO anon 
USING (bucket_id = 'fotograflar');
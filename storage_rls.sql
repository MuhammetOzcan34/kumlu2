-- Storage bucket için RLS politikaları
-- Bu komutları Supabase SQL Editor'da çalıştırın

-- 1. Images bucket'ı için public read access
CREATE POLICY "Allow public read access to images" ON storage.objects
  FOR SELECT USING (bucket_id = 'images');

-- 2. Authenticated kullanıcılar için upload access
CREATE POLICY "Allow authenticated uploads to images" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'images' 
    AND auth.role() = 'authenticated'
  );

-- 3. Admin kullanıcılar için full access
CREATE POLICY "Allow admin full access to images" ON storage.objects
  FOR ALL USING (
    bucket_id = 'images' 
    AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 4. Kullanıcılar kendi yükledikleri dosyaları silebilir
CREATE POLICY "Allow users to delete their own uploads" ON storage.objects
  FOR DELETE USING (
    bucket_id = 'images' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

-- Watermark klasörü için RLS politikaları
-- 1. Admin kullanıcılar için full access
CREATE POLICY "Allow admin full access to watermark" ON storage.objects
  FOR ALL USING (
    bucket_id = 'fotograflar' AND name LIKE 'watermark/%' AND EXISTS (
      SELECT 1 FROM public.profiles 
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 2. Public read access kısıtlaması
CREATE POLICY "Restrict public read access to watermark" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'fotograflar' AND name LIKE 'watermark/%' AND false
  );

-- 3. Authenticated kullanıcılar için watermark yükleme izni
CREATE POLICY "Allow authenticated uploads to watermark" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'fotograflar' AND name LIKE 'watermark/%' AND auth.role() = 'authenticated'
  );
-- Storage bucket'ları için RLS politikalarını kontrol et ve düzelt

-- Mevcut storage politikalarını kontrol et
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE schemaname = 'storage' AND tablename IN ('objects', 'buckets');

-- Storage buckets için izinleri ver
GRANT ALL PRIVILEGES ON storage.buckets TO authenticated;
GRANT SELECT ON storage.buckets TO anon;

-- Storage objects için izinleri ver
GRANT ALL PRIVILEGES ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;

-- Storage buckets için politikalar
DROP POLICY IF EXISTS "Authenticated users can manage buckets" ON storage.buckets;
DROP POLICY IF EXISTS "Public can read buckets" ON storage.buckets;

CREATE POLICY "Authenticated users can manage buckets" ON storage.buckets
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can read buckets" ON storage.buckets
    FOR SELECT USING (true);

-- Storage objects için politikalar
DROP POLICY IF EXISTS "Authenticated users can manage objects" ON storage.objects;
DROP POLICY IF EXISTS "Public can read objects" ON storage.objects;

CREATE POLICY "Authenticated users can manage objects" ON storage.objects
    FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Public can read objects" ON storage.objects
    FOR SELECT USING (true);

-- Public bucket oluştur (eğer yoksa)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES ('public', 'public', true, 52428800, ARRAY['image/*', 'video/*', 'application/pdf'])
ON CONFLICT (id) DO UPDATE SET
    public = true,
    file_size_limit = 52428800,
    allowed_mime_types = ARRAY['image/*', 'video/*', 'application/pdf'];
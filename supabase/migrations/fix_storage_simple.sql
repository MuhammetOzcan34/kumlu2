-- Storage CORS ve bucket politikalarını basit şekilde düzelt
-- Bu migration storage erişim sorunlarını çözer

-- 1. Fotograflar bucket'ının mevcut durumunu kontrol et
SELECT 
    'Bucket Durumu' as kontrol,
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'fotograflar';

-- 2. Bucket'ı public yap ve ayarlarını güncelle
UPDATE storage.buckets 
SET 
    public = true,
    file_size_limit = 52428800, -- 50MB
    allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
WHERE name = 'fotograflar';

-- 3. Eğer bucket yoksa oluştur
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
SELECT 
    'fotograflar',
    'fotograflar',
    true,
    52428800,
    ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
WHERE NOT EXISTS (
    SELECT 1 FROM storage.buckets WHERE name = 'fotograflar'
);

-- 4. Mevcut storage politikalarını temizle (sadece fotograflar bucket için)
DO $$ 
BEGIN
    -- Objects tablosu politikaları
    DROP POLICY IF EXISTS "Herkese okuma erişimi" ON storage.objects;
    DROP POLICY IF EXISTS "Authenticated users can upload" ON storage.objects;
    DROP POLICY IF EXISTS "Admin full access" ON storage.objects;
    DROP POLICY IF EXISTS "Users can update own files" ON storage.objects;
    DROP POLICY IF EXISTS "Users can delete own files" ON storage.objects;
    DROP POLICY IF EXISTS "fotograflar_select" ON storage.objects;
    DROP POLICY IF EXISTS "fotograflar_insert" ON storage.objects;
    DROP POLICY IF EXISTS "fotograflar_update" ON storage.objects;
    DROP POLICY IF EXISTS "fotograflar_delete" ON storage.objects;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Bazı politikalar zaten mevcut değil: %', SQLERRM;
END $$;

-- 5. Basit ve etkili storage politikaları oluştur

-- Herkese okuma erişimi (public bucket için)
CREATE POLICY "Public read access" ON storage.objects
    FOR SELECT
    USING (bucket_id = 'fotograflar');

-- Kimliği doğrulanmış kullanıcılar dosya yükleyebilir
CREATE POLICY "Authenticated upload" ON storage.objects
    FOR INSERT
    TO authenticated
    WITH CHECK (bucket_id = 'fotograflar');

-- Admin kullanıcılar her şeyi yapabilir
CREATE POLICY "Admin full access" ON storage.objects
    FOR ALL
    TO authenticated
    USING (
        bucket_id = 'fotograflar' AND (
            (auth.jwt() ->> 'role')::text = 'admin' 
            OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
            OR EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.user_id = auth.uid() 
                AND p.role = 'admin'
            )
        )
    )
    WITH CHECK (
        bucket_id = 'fotograflar' AND (
            (auth.jwt() ->> 'role')::text = 'admin' 
            OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
            OR EXISTS (
                SELECT 1 FROM profiles p 
                WHERE p.user_id = auth.uid() 
                AND p.role = 'admin'
            )
        )
    );

-- Kimliği doğrulanmış kullanıcılar kendi dosyalarını güncelleyebilir
CREATE POLICY "Authenticated update own" ON storage.objects
    FOR UPDATE
    TO authenticated
    USING (
        bucket_id = 'fotograflar' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    )
    WITH CHECK (
        bucket_id = 'fotograflar' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- Kimliği doğrulanmış kullanıcılar kendi dosyalarını silebilir
CREATE POLICY "Authenticated delete own" ON storage.objects
    FOR DELETE
    TO authenticated
    USING (
        bucket_id = 'fotograflar' AND 
        auth.uid()::text = (storage.foldername(name))[1]
    );

-- 6. Gerekli izinleri ver
GRANT ALL ON storage.objects TO authenticated;
GRANT ALL ON storage.buckets TO authenticated;
GRANT SELECT ON storage.objects TO anon;
GRANT SELECT ON storage.buckets TO anon;

-- 7. Sonuç kontrolü
SELECT 
    'Storage Politikaları Oluşturuldu' as mesaj,
    COUNT(*) as politika_sayisi
FROM pg_policies 
WHERE schemaname = 'storage' 
    AND tablename = 'objects';

SELECT 
    'Bucket Durumu' as kontrol,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'fotograflar';
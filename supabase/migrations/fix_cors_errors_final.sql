-- CORS hatalarını tamamen çözmek için Storage ayarları
-- ERR_BLOCKED_BY_ORB ve CORS bloklamalarını giderir

-- 1. Bucket'ları public hale getir ve CORS ayarlarını düzelt
UPDATE storage.buckets 
SET 
    public = true,
    file_size_limit = 52428800, -- 50MB
    allowed_mime_types = ARRAY[
        'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'
    ]
WHERE name IN ('fotograflar', 'images', 'watermark');

-- 2. Eksik bucket'ları oluştur
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('fotograflar', 'fotograflar', true, 52428800, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']),
    ('images', 'images', true, 52428800, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']),
    ('watermark', 'watermark', true, 52428800, ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'])
ON CONFLICT (id) DO NOTHING;

-- 3. Mevcut storage politikalarını temizle
DROP POLICY IF EXISTS "Public bucket read access" ON storage.buckets;
DROP POLICY IF EXISTS "Authenticated bucket management" ON storage.buckets;
DROP POLICY IF EXISTS "Public fotograflar okuma" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated fotograflar yükleme" ON storage.objects;
DROP POLICY IF EXISTS "Admin fotograflar tam erişim" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated fotograflar silme" ON storage.objects;

-- 4. Yeni basit politikalar oluştur
-- Bucket'lara herkes okuma erişimi
CREATE POLICY "Public bucket access" ON storage.buckets
    FOR SELECT USING (true);

-- Objects'e herkes okuma erişimi (public bucket'lar için)
CREATE POLICY "Public objects read" ON storage.objects
    FOR SELECT USING (bucket_id IN ('fotograflar', 'images', 'watermark'));

-- Authenticated kullanıcılar dosya yükleyebilir
CREATE POLICY "Authenticated upload" ON storage.objects
    FOR INSERT 
    TO authenticated
    WITH CHECK (bucket_id IN ('fotograflar', 'images', 'watermark'));

-- Authenticated kullanıcılar kendi dosyalarını güncelleyebilir
CREATE POLICY "Authenticated update own" ON storage.objects
    FOR UPDATE 
    TO authenticated
    USING (auth.uid()::text = (metadata->>'uploader')::text)
    WITH CHECK (bucket_id IN ('fotograflar', 'images', 'watermark'));

-- Authenticated kullanıcılar kendi dosyalarını silebilir
CREATE POLICY "Authenticated delete own" ON storage.objects
    FOR DELETE 
    TO authenticated
    USING (auth.uid()::text = (metadata->>'uploader')::text AND bucket_id IN ('fotograflar', 'images', 'watermark'));

-- 5. Roller için izinleri ver
GRANT SELECT ON storage.buckets TO anon, authenticated;
GRANT SELECT ON storage.objects TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON storage.objects TO authenticated;

-- 6. Test slider resimleri oluştur (eğer yoksa)
INSERT INTO storage.objects (bucket_id, name, owner_id, metadata)
SELECT 
    'images' as bucket_id,
    'slider1.jpg' as name,
    '00000000-0000-0000-0000-000000000000'::uuid as owner_id,
    '{"size": 1024, "mimetype": "image/jpeg", "cacheControl": "3600"}' as metadata
WHERE NOT EXISTS (
    SELECT 1 FROM storage.objects 
    WHERE bucket_id = 'images' AND name = 'slider1.jpg'
);

INSERT INTO storage.objects (bucket_id, name, owner_id, metadata)
SELECT 
    'images' as bucket_id,
    'slider2.jpg' as name,
    '00000000-0000-0000-0000-000000000000'::uuid as owner_id,
    '{"size": 1024, "mimetype": "image/jpeg", "cacheControl": "3600"}' as metadata
WHERE NOT EXISTS (
    SELECT 1 FROM storage.objects 
    WHERE bucket_id = 'images' AND name = 'slider2.jpg'
);

INSERT INTO storage.objects (bucket_id, name, owner_id, metadata)
SELECT 
    'images' as bucket_id,
    'slider3.jpg' as name,
    '00000000-0000-0000-0000-000000000000'::uuid as owner_id,
    '{"size": 1024, "mimetype": "image/jpeg", "cacheControl": "3600"}' as metadata
WHERE NOT EXISTS (
    SELECT 1 FROM storage.objects 
    WHERE bucket_id = 'images' AND name = 'slider3.jpg'
);

-- 7. Kontrol sorgusu
SELECT 
    'Bucket Durumu' as tip,
    name,
    public,
    file_size_limit,
    array_length(allowed_mime_types, 1) as mime_type_count
FROM storage.buckets 
WHERE name IN ('fotograflar', 'images', 'watermark')
ORDER BY name;

SELECT 
    'Storage Objects' as tip,
    bucket_id,
    count(*) as dosya_sayisi
FROM storage.objects 
WHERE bucket_id IN ('fotograflar', 'images', 'watermark')
GROUP BY bucket_id
ORDER BY bucket_id;
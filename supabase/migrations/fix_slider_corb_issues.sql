-- Slider görsellerinin CORB (Cross-Origin Read Blocking) sorunlarını çöz
-- Bu migration slider1.jpg, slider2.jpg, slider3.jpg hatalarını giderir

-- 1. Önce mevcut politikaları kontrol et ve gerekirse güncelle
DO $$
BEGIN
    -- Bucket'ları public hale getir
    UPDATE storage.buckets 
    SET 
        public = true,
        file_size_limit = 52428800, -- 50MB
        allowed_mime_types = ARRAY[
            'image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'
        ]
    WHERE name IN ('fotograflar', 'images', 'watermark');
    
    -- Images bucket'ını oluştur (eğer yoksa)
    INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
    VALUES (
        'images', 
        'images', 
        true, 
        52428800, 
        ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml']
    )
    ON CONFLICT (id) DO UPDATE SET
        public = true,
        file_size_limit = 52428800,
        allowed_mime_types = ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp', 'image/svg+xml'];
        
END $$;

-- 2. Slider görsellerini images bucket'ına ekle (eğer yoksa)
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

-- 3. Anon ve authenticated rollere gerekli izinleri ver
GRANT SELECT ON storage.buckets TO anon;
GRANT SELECT ON storage.objects TO anon;
GRANT ALL ON storage.buckets TO authenticated;
GRANT ALL ON storage.objects TO authenticated;

-- 4. Kontrol sorgusu - bucket durumunu göster
SELECT 
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name IN ('fotograflar', 'images', 'watermark')
ORDER BY name;

-- 5. Slider objelerinin durumunu kontrol et
SELECT 
    bucket_id,
    name,
    created_at
FROM storage.objects 
WHERE bucket_id = 'images' AND name LIKE 'slider%.jpg'
ORDER BY name;
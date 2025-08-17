-- Storage durumunu kontrol et ve sadece gerekli düzeltmeleri yap

-- 1. Mevcut bucket durumunu kontrol et
SELECT 
    'Mevcut Bucket Durumu' as kontrol,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'fotograflar';

-- 2. Mevcut storage politikalarını listele
SELECT 
    'Mevcut Storage Politikaları' as kontrol,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'storage' 
    AND tablename = 'objects'
ORDER BY policyname;

-- 3. Bucket'ı public yap (eğer değilse)
UPDATE storage.buckets 
SET 
    public = true,
    file_size_limit = COALESCE(file_size_limit, 52428800),
    allowed_mime_types = COALESCE(
        allowed_mime_types, 
        ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
    )
WHERE name = 'fotograflar' 
    AND (public = false OR file_size_limit IS NULL OR allowed_mime_types IS NULL);

-- 4. Eğer bucket yoksa oluştur
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM storage.buckets WHERE name = 'fotograflar') THEN
        INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
        VALUES (
            'fotograflar',
            'fotograflar',
            true,
            52428800,
            ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
        );
        RAISE NOTICE 'Fotograflar bucket oluşturuldu';
    END IF;
END $$;

-- 5. Gerekli izinleri kontrol et ve ver
DO $$
BEGIN
    -- Storage objects tablosuna izinler
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.role_table_grants 
        WHERE table_schema = 'storage' 
        AND table_name = 'objects' 
        AND grantee = 'authenticated'
        AND privilege_type = 'SELECT'
    ) THEN
        GRANT SELECT ON storage.objects TO authenticated;
        RAISE NOTICE 'Authenticated role için SELECT izni verildi';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.role_table_grants 
        WHERE table_schema = 'storage' 
        AND table_name = 'objects' 
        AND grantee = 'authenticated'
        AND privilege_type = 'INSERT'
    ) THEN
        GRANT INSERT ON storage.objects TO authenticated;
        RAISE NOTICE 'Authenticated role için INSERT izni verildi';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.role_table_grants 
        WHERE table_schema = 'storage' 
        AND table_name = 'objects' 
        AND grantee = 'anon'
        AND privilege_type = 'SELECT'
    ) THEN
        GRANT SELECT ON storage.objects TO anon;
        RAISE NOTICE 'Anon role için SELECT izni verildi';
    END IF;
END $$;

-- 6. Admin için özel politika ekle (eğer yoksa)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE schemaname = 'storage' 
        AND tablename = 'objects'
        AND policyname = 'Admin tam erişim fotograflar'
    ) THEN
        CREATE POLICY "Admin tam erişim fotograflar" ON storage.objects
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
        RAISE NOTICE 'Admin tam erişim politikası oluşturuldu';
    END IF;
END $$;

-- 7. Sonuç raporu
SELECT 
    'Storage Kontrol Tamamlandı' as mesaj,
    (
        SELECT COUNT(*) 
        FROM pg_policies 
        WHERE schemaname = 'storage' AND tablename = 'objects'
    ) as toplam_politika,
    (
        SELECT public 
        FROM storage.buckets 
        WHERE name = 'fotograflar'
    ) as bucket_public_durumu;

-- 8. Storage erişim testi
SELECT 
    'Storage Erişim Testi' as test,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM storage.buckets 
            WHERE name = 'fotograflar' AND public = true
        ) THEN 'Bucket public - OK'
        ELSE 'Bucket public değil - HATA'
    END as bucket_durumu,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.role_table_grants 
            WHERE table_schema = 'storage' 
            AND table_name = 'objects' 
            AND grantee = 'authenticated'
        ) THEN 'Authenticated izinleri var - OK'
        ELSE 'Authenticated izinleri yok - HATA'
    END as izin_durumu;
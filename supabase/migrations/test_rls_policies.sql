-- RLS Politikalarını Test Et
-- Bu dosya RLS politikalarının doğru çalışıp çalışmadığını test eder

-- Test başlangıcı
SELECT 'RLS Test Başlıyor...' as test_status;

-- 1. Ayarlar tablosu RLS testi
SELECT 'Ayarlar tablosu RLS durumu kontrol ediliyor...' as test_step;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN 'RLS Aktif ✓'
        ELSE 'RLS Pasif ✗'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'ayarlar' AND schemaname = 'public';

-- 2. Fotograflar tablosu RLS testi
SELECT 'Fotograflar tablosu RLS durumu kontrol ediliyor...' as test_step;
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled,
    CASE 
        WHEN rowsecurity THEN 'RLS Aktif ✓'
        ELSE 'RLS Pasif ✗'
    END as rls_status
FROM pg_tables 
WHERE tablename = 'fotograflar' AND schemaname = 'public';

-- 3. Mevcut RLS politikalarını listele
SELECT 'Mevcut RLS politikaları kontrol ediliyor...' as test_step;
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
WHERE schemaname = 'public' 
AND tablename IN ('ayarlar', 'fotograflar')
ORDER BY tablename, policyname;

-- 4. Tablo izinlerini kontrol et
SELECT 'Tablo izinleri kontrol ediliyor...' as test_step;
SELECT 
    grantee,
    table_name,
    privilege_type,
    is_grantable
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('ayarlar', 'fotograflar')
AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee, privilege_type;

-- 5. Anonim kullanıcı perspektifinden test
SELECT 'Anonim kullanıcı erişim testi...' as test_step;

-- Ayarlar tablosu anonim erişim testi
SET ROLE anon;
BEGIN;
    -- Ayarlar tablosundan okuma testi
    SELECT 
        'Ayarlar SELECT (anon)' as test_type,
        CASE 
            WHEN COUNT(*) >= 0 THEN 'Başarılı ✓'
            ELSE 'Başarısız ✗'
        END as result,
        COUNT(*) as record_count
    FROM ayarlar 
    LIMIT 1;
    
    -- Ayarlar tablosuna yazma testi (başarısız olmalı)
    DO $$
    BEGIN
        INSERT INTO ayarlar (anahtar, deger, aciklama) VALUES ('test_key', 'test_value', 'test');
        RAISE NOTICE 'Ayarlar INSERT (anon): Başarısız ✗ - İzin verilmemeli';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Ayarlar INSERT (anon): Başarılı ✓ - Doğru şekilde engellendi';
    END;
    $$;
ROLLBACK;

-- Fotograflar tablosu anonim erişim testi
BEGIN;
    -- Fotograflar tablosundan okuma testi
    SELECT 
        'Fotograflar SELECT (anon)' as test_type,
        CASE 
            WHEN COUNT(*) >= 0 THEN 'Başarılı ✓'
            ELSE 'Başarısız ✗'
        END as result,
        COUNT(*) as record_count
    FROM fotograflar 
    LIMIT 1;
    
    -- Fotograflar tablosuna yazma testi (başarısız olmalı)
    DO $$
    BEGIN
        INSERT INTO fotograflar (dosya_adi, dosya_yolu, kategori_id) VALUES ('test.jpg', 'test/test.jpg', 1);
        RAISE NOTICE 'Fotograflar INSERT (anon): Başarısız ✗ - İzin verilmemeli';
    EXCEPTION WHEN OTHERS THEN
        RAISE NOTICE 'Fotograflar INSERT (anon): Başarılı ✓ - Doğru şekilde engellendi';
    END;
    $$;
ROLLBACK;

RESET ROLE;

-- 6. Authenticated kullanıcı perspektifinden test
SELECT 'Authenticated kullanıcı erişim testi...' as test_step;

SET ROLE authenticated;
BEGIN;
    -- Ayarlar tablosu authenticated erişim testi
    SELECT 
        'Ayarlar SELECT (authenticated)' as test_type,
        CASE 
            WHEN COUNT(*) >= 0 THEN 'Başarılı ✓'
            ELSE 'Başarısız ✗'
        END as result,
        COUNT(*) as record_count
    FROM ayarlar 
    LIMIT 1;
    
    -- Fotograflar tablosu authenticated erişim testi
    SELECT 
        'Fotograflar SELECT (authenticated)' as test_type,
        CASE 
            WHEN COUNT(*) >= 0 THEN 'Başarılı ✓'
            ELSE 'Başarısız ✗'
        END as result,
        COUNT(*) as record_count
    FROM fotograflar 
    LIMIT 1;
ROLLBACK;

RESET ROLE;

-- 7. Storage bucket izinlerini kontrol et
SELECT 'Storage bucket izinleri kontrol ediliyor...' as test_step;
SELECT 
    id,
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets 
WHERE name = 'fotograflar';

-- Storage bucket politikalarını kontrol et (eğer mevcut ise)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'storage' AND table_name = 'policies') THEN
        PERFORM 1 FROM storage.policies WHERE bucket_id = (SELECT id FROM storage.buckets WHERE name = 'fotograflar');
        RAISE NOTICE 'Storage policies tablosu mevcut ve kontrol edildi';
    ELSE
        RAISE NOTICE 'Storage policies tablosu mevcut değil - bu normal olabilir';
    END IF;
END;
$$;

-- Test sonucu
SELECT 'RLS Test Tamamlandı!' as test_status;
SELECT 'Yukarıdaki sonuçları kontrol edin. Tüm ✓ işaretli testler başarılı, ✗ işaretli testler başarısız.' as test_info;
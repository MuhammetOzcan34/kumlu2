-- Eksik RLS Politikalarını Kontrol Et
-- Bu dosya eksik olan RLS politikalarını tespit eder ve gerekirse oluşturur

-- Test başlangıcı
SELECT 'Eksik RLS Politikaları Kontrol Ediliyor...' as status;

-- 1. Mevcut RLS politikalarını detaylı listele
SELECT 'Mevcut RLS Politikaları:' as info;
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd as command_type,
    CASE 
        WHEN cmd = 'SELECT' THEN 'Okuma İzni'
        WHEN cmd = 'INSERT' THEN 'Ekleme İzni'
        WHEN cmd = 'UPDATE' THEN 'Güncelleme İzni'
        WHEN cmd = 'DELETE' THEN 'Silme İzni'
        WHEN cmd = 'ALL' THEN 'Tüm İzinler'
        ELSE cmd
    END as command_description,
    qual as condition_expression
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('ayarlar', 'fotograflar')
ORDER BY tablename, cmd, policyname;

-- 2. Ayarlar tablosu için gerekli politikaları kontrol et
SELECT 'Ayarlar Tablosu Politika Kontrolü:' as info;

-- Ayarlar SELECT politikası kontrolü
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'ayarlar' 
            AND cmd = 'SELECT'
        ) THEN 'Ayarlar SELECT politikası mevcut ✓'
        ELSE 'Ayarlar SELECT politikası eksik ✗'
    END as select_policy_status;

-- Ayarlar INSERT politikası kontrolü
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'ayarlar' 
            AND cmd = 'INSERT'
        ) THEN 'Ayarlar INSERT politikası mevcut ✓'
        ELSE 'Ayarlar INSERT politikası eksik ✗'
    END as insert_policy_status;

-- Ayarlar UPDATE politikası kontrolü
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'ayarlar' 
            AND cmd = 'UPDATE'
        ) THEN 'Ayarlar UPDATE politikası mevcut ✓'
        ELSE 'Ayarlar UPDATE politikası eksik ✗'
    END as update_policy_status;

-- 3. Fotograflar tablosu için gerekli politikaları kontrol et
SELECT 'Fotograflar Tablosu Politika Kontrolü:' as info;

-- Fotograflar SELECT politikası kontrolü
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'fotograflar' 
            AND cmd = 'SELECT'
        ) THEN 'Fotograflar SELECT politikası mevcut ✓'
        ELSE 'Fotograflar SELECT politikası eksik ✗'
    END as select_policy_status;

-- Fotograflar INSERT politikası kontrolü
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'fotograflar' 
            AND cmd = 'INSERT'
        ) THEN 'Fotograflar INSERT politikası mevcut ✓'
        ELSE 'Fotograflar INSERT politikası eksik ✗'
    END as insert_policy_status;

-- Fotograflar UPDATE politikası kontrolü
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'fotograflar' 
            AND cmd = 'UPDATE'
        ) THEN 'Fotograflar UPDATE politikası mevcut ✓'
        ELSE 'Fotograflar UPDATE politikası eksik ✗'
    END as update_policy_status;

-- Fotograflar DELETE politikası kontrolü
SELECT 
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE schemaname = 'public' 
            AND tablename = 'fotograflar' 
            AND cmd = 'DELETE'
        ) THEN 'Fotograflar DELETE politikası mevcut ✓'
        ELSE 'Fotograflar DELETE politikası eksik ✗'
    END as delete_policy_status;

-- 4. Tablo izinlerini detaylı kontrol et
SELECT 'Tablo İzinleri Detay Kontrolü:' as info;
SELECT 
    table_name,
    grantee,
    privilege_type,
    is_grantable,
    CASE 
        WHEN grantee = 'anon' AND privilege_type = 'SELECT' THEN 'Anonim okuma izni ✓'
        WHEN grantee = 'authenticated' AND privilege_type IN ('SELECT', 'INSERT', 'UPDATE', 'DELETE') THEN 'Authenticated ' || privilege_type || ' izni ✓'
        WHEN grantee = 'service_role' THEN 'Service role ' || privilege_type || ' izni ✓'
        ELSE grantee || ' ' || privilege_type || ' izni'
    END as permission_description
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('ayarlar', 'fotograflar')
AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY table_name, grantee, privilege_type;

-- 5. Eksik izinleri tespit et
SELECT 'Eksik İzin Kontrolü:' as info;

-- Ayarlar tablosu için eksik izinler
WITH required_permissions AS (
    SELECT 'ayarlar' as table_name, 'anon' as role_name, 'SELECT' as privilege
    UNION ALL
    SELECT 'ayarlar', 'authenticated', 'SELECT'
    UNION ALL
    SELECT 'ayarlar', 'authenticated', 'INSERT'
    UNION ALL
    SELECT 'ayarlar', 'authenticated', 'UPDATE'
    UNION ALL
    SELECT 'fotograflar', 'anon', 'SELECT'
    UNION ALL
    SELECT 'fotograflar', 'authenticated', 'SELECT'
    UNION ALL
    SELECT 'fotograflar', 'authenticated', 'INSERT'
    UNION ALL
    SELECT 'fotograflar', 'authenticated', 'UPDATE'
    UNION ALL
    SELECT 'fotograflar', 'authenticated', 'DELETE'
),
existing_permissions AS (
    SELECT 
        table_name,
        grantee as role_name,
        privilege_type as privilege
    FROM information_schema.role_table_grants 
    WHERE table_schema = 'public' 
    AND table_name IN ('ayarlar', 'fotograflar')
    AND grantee IN ('anon', 'authenticated')
)
SELECT 
    rp.table_name,
    rp.role_name,
    rp.privilege,
    CASE 
        WHEN ep.privilege IS NULL THEN 'EKSİK ✗'
        ELSE 'MEVCUT ✓'
    END as permission_status
FROM required_permissions rp
LEFT JOIN existing_permissions ep ON 
    rp.table_name = ep.table_name 
    AND rp.role_name = ep.role_name 
    AND rp.privilege = ep.privilege
ORDER BY rp.table_name, rp.role_name, rp.privilege;

SELECT 'Eksik RLS Politikaları Kontrolü Tamamlandı!' as status;
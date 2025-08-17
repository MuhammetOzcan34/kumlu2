-- RLS politikalarını kontrol et ve admin erişimini doğrula

-- 1. Profiles tablosundaki mevcut RLS politikalarını listele
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
WHERE schemaname = 'public' AND tablename = 'profiles'
ORDER BY policyname;

-- 2. Profiles tablosunun RLS durumunu kontrol et
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' AND tablename = 'profiles';

-- 3. Tüm public şemasındaki tabloların RLS durumunu kontrol et
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 4. Anon ve authenticated rollerinin profiles tablosundaki izinlerini kontrol et
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'profiles' 
    AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;

-- 5. Tüm public tabloları için anon ve authenticated izinlerini kontrol et
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee, privilege_type;
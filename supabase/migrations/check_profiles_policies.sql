-- Profiles tablosundaki mevcut RLS politikalarını kontrol et
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
WHERE tablename = 'profiles';

-- Profiles tablosundaki mevcut izinleri kontrol et
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'profiles' 
AND grantee IN ('anon', 'authenticated')
ORDER BY grantee, privilege_type;
-- Tablo izinlerini kontrol et
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Sequence izinlerini kontrol et
SELECT 
    grantee,
    object_name,
    privilege_type
FROM information_schema.role_usage_grants 
WHERE object_schema = 'public' 
    AND grantee IN ('anon', 'authenticated')
ORDER BY object_name, grantee;

-- Storage bucket politikalarını kontrol et
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'storage' 
    AND tablename = 'objects'
ORDER BY policyname;
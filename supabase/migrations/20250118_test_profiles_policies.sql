-- Test profiles tablosu RLS politikalarını kontrol et
-- Bu dosya sadece test amaçlıdır, herhangi bir değişiklik yapmaz

-- Mevcut politikaları listele
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
WHERE tablename = 'profiles' AND schemaname = 'public';

-- RLS durumunu kontrol et
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename = 'profiles' AND schemaname = 'public';

-- Anon ve authenticated rollerin izinlerini kontrol et
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'profiles'
    AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;
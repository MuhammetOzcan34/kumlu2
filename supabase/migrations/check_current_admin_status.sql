-- Mevcut kullanıcının admin durumunu kontrol et
-- Bu sorgu şu anda giriş yapmış kullanıcının admin yetkisine sahip olup olmadığını kontrol eder

-- 1. Auth tablosundaki tüm kullanıcıları ve metadata bilgilerini listele
SELECT 
    au.id as user_id,
    au.email,
    au.raw_app_meta_data,
    au.raw_user_meta_data,
    au.created_at,
    au.last_sign_in_at,
    au.email_confirmed_at
FROM auth.users au
ORDER BY au.last_sign_in_at DESC NULLS LAST;

-- 2. Profiles tablosundaki kullanıcı rollerini kontrol et
SELECT 
    p.id,
    p.user_id,
    p.display_name,
    p.role,
    p.created_at,
    au.email
FROM profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
ORDER BY p.created_at DESC;

-- 3. Kullanici_rolleri tablosundaki admin bilgilerini kontrol et
SELECT 
    kr.email,
    kr.role,
    kr.is_super_admin,
    kr.created_at
FROM kullanici_rolleri kr
ORDER BY kr.created_at DESC;

-- 4. Kategoriler tablosundaki RLS politikalarını kontrol et
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
WHERE tablename = 'kategoriler'
ORDER BY policyname;

-- 5. Mevcut oturumun JWT token bilgilerini kontrol et (eğer varsa)
SELECT 
    auth.uid() as current_user_id,
    auth.jwt() as current_jwt_token;

-- 6. Kategoriler tablosuna erişim izinlerini kontrol et
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'kategoriler'
    AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY grantee, privilege_type;
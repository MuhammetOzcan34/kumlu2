-- Şu anda giriş yapmış kullanıcının bilgilerini kontrol et
-- Bu sorguyu çalıştırdıktan sonra sonuçları manuel olarak kontrol edeceğiz

-- 1. Auth tablosundaki tüm kullanıcıları listele
SELECT 
    au.id as user_id,
    au.email,
    au.created_at as auth_created_at,
    au.email_confirmed_at,
    au.last_sign_in_at
FROM auth.users au
ORDER BY au.created_at DESC;

-- 2. Profiles tablosundaki kullanıcıları ve rollerini listele
SELECT 
    p.id,
    p.user_id,
    p.email as profile_email,
    p.display_name,
    p.full_name,
    p.role,
    p.created_at as profile_created_at,
    au.email as auth_email
FROM profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
ORDER BY p.created_at DESC;

-- 3. Kullanıcı rolleri tablosundaki verileri kontrol et
SELECT 
    ur.user_id,
    ur.role,
    au.email
FROM user_roles ur
LEFT JOIN auth.users au ON ur.user_id = au.id;

-- 4. Kullanıcı rolleri (Türkçe tablo) tablosundaki verileri kontrol et
SELECT 
    kr.email,
    kr.role,
    kr.is_super_admin,
    kr.created_at
FROM kullanici_rolleri kr
ORDER BY kr.created_at DESC;
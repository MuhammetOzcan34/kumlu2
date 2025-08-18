-- Mevcut admin kullanıcısının durumunu kontrol et
-- Bu sorgu admin kullanıcısının auth ve profiles tablolarındaki durumunu gösterir

-- 1. Auth tablosundaki kullanıcıları ve metadata bilgilerini listele
SELECT 
    'AUTH USERS' as table_name,
    au.id as user_id,
    au.email,
    au.raw_app_meta_data,
    au.raw_user_meta_data,
    au.created_at,
    au.last_sign_in_at,
    au.email_confirmed_at
FROM auth.users au
ORDER BY au.created_at DESC;

-- 2. Profiles tablosundaki kullanıcıları listele
SELECT 
    'PROFILES' as table_name,
    p.id,
    p.user_id,
    p.email,
    p.display_name,
    p.full_name,
    p.role,
    p.created_at,
    p.updated_at
FROM profiles p
ORDER BY p.created_at DESC;

-- 3. Auth ve profiles tablolarını birleştirerek tam görünüm
SELECT 
    'COMBINED VIEW' as table_name,
    au.id as auth_user_id,
    au.email as auth_email,
    au.raw_app_meta_data->>'role' as auth_metadata_role,
    p.id as profile_id,
    p.user_id as profile_user_id,
    p.email as profile_email,
    p.role as profile_role,
    p.display_name,
    p.full_name,
    au.last_sign_in_at,
    au.email_confirmed_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
ORDER BY au.created_at DESC;

-- 4. Admin kullanıcısını özel olarak kontrol et
SELECT 
    'ADMIN CHECK' as table_name,
    au.email,
    CASE 
        WHEN au.raw_app_meta_data->>'role' = 'admin' THEN 'Auth metadata: admin'
        WHEN p.role = 'admin' THEN 'Profile role: admin'
        ELSE 'No admin role found'
    END as admin_status,
    au.raw_app_meta_data,
    p.role as profile_role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE au.email LIKE '%admin%' OR p.role = 'admin' OR au.raw_app_meta_data->>'role' = 'admin';
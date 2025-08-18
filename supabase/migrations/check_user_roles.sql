-- Kullanıcı rolleri tablosundaki mevcut verileri kontrol et
SELECT 
    email,
    role,
    is_super_admin,
    created_at,
    user_id
FROM kullanici_rolleri
ORDER BY created_at DESC;

-- Auth.users tablosundaki kullanıcıları da kontrol et
SELECT 
    id,
    email,
    raw_app_meta_data,
    raw_user_meta_data,
    created_at
FROM auth.users
ORDER BY created_at DESC;

-- Profiles tablosundaki kullanıcıları kontrol et
SELECT 
    user_id,
    email,
    display_name,
    role,
    created_at
FROM profiles
ORDER BY created_at DESC;

-- Admin kullanıcısının tüm tablolardaki durumunu birleştir
SELECT 
    u.id as user_id,
    u.email,
    u.raw_app_meta_data,
    u.raw_user_meta_data,
    p.role as profile_role,
    kr.role as kullanici_rolleri_role,
    kr.is_super_admin
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN kullanici_rolleri kr ON u.email = kr.email
WHERE u.email LIKE '%admin%' OR kr.role = 'admin' OR p.role = 'admin'
ORDER BY u.created_at DESC;
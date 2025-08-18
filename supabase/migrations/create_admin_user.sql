-- Admin kullanıcısını kullanici_rolleri tablosuna ekle
INSERT INTO kullanici_rolleri (email, role, is_super_admin, created_at, updated_at)
VALUES ('admin@kumlu2.com', 'admin', true, NOW(), NOW())
ON CONFLICT (email) DO UPDATE SET
    role = 'admin',
    is_super_admin = true,
    updated_at = NOW();

-- Profiles tablosunda admin kullanıcısının rolünü güncelle
UPDATE profiles 
SET role = 'admin', updated_at = NOW()
WHERE email = 'admin@kumlu2.com';

-- Eğer profiles tablosunda yoksa ekle (auth.users'dan user_id alarak)
INSERT INTO profiles (user_id, email, display_name, role, created_at, updated_at)
SELECT 
    u.id,
    u.email,
    'Admin Kullanıcı',
    'admin',
    NOW(),
    NOW()
FROM auth.users u
WHERE u.email = 'admin@kumlu2.com'
    AND NOT EXISTS (
        SELECT 1 FROM profiles p WHERE p.user_id = u.id
    );

-- Kontrol sorgusu - admin kullanıcısının durumunu göster
SELECT 
    u.id as user_id,
    u.email,
    u.raw_app_meta_data,
    p.role as profile_role,
    kr.role as kullanici_rolleri_role,
    kr.is_super_admin
FROM auth.users u
LEFT JOIN profiles p ON u.id = p.user_id
LEFT JOIN kullanici_rolleri kr ON u.email = kr.email
WHERE u.email = 'admin@kumlu2.com';
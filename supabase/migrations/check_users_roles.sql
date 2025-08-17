-- Mevcut kullanıcıları ve rollerini kontrol et
SELECT 
    p.id,
    p.user_id,
    p.email,
    p.display_name,
    p.full_name,
    p.role,
    p.created_at,
    au.email as auth_email
FROM profiles p
LEFT JOIN auth.users au ON p.user_id = au.id
ORDER BY p.created_at DESC;

-- Kullanıcı rolleri tablosunu kontrol et
SELECT user_id, role FROM user_roles;

-- Kullanıcı rolleri tablosunu kontrol et (Türkçe tablo adı)
SELECT email, role, is_super_admin, created_at FROM kullanici_rolleri ORDER BY created_at DESC;
-- Mevcut kullanıcıları ve rollerini kontrol et
SELECT 
    p.id,
    p.email,
    p.display_name,
    p.full_name,
    p.role,
    p.created_at,
    p.user_id
FROM profiles p
ORDER BY p.created_at DESC;

-- Özellikle admin@kumlu2.com ve ckumlama@gmail.com kullanıcılarını kontrol et
SELECT 
    p.id,
    p.email,
    p.display_name,
    p.full_name,
    p.role,
    p.created_at,
    p.user_id
FROM profiles p
WHERE p.email IN ('admin@kumlu2.com', 'ckumlama@gmail.com')
ORDER BY p.email;
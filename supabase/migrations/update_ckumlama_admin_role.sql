-- ckumlama@gmail.com hesabına admin rolü ver
UPDATE profiles 
SET role = 'admin',
    updated_at = now()
WHERE email = 'ckumlama@gmail.com';

-- Eğer kullanıcı yoksa, yeni bir profil oluştur
INSERT INTO profiles (email, role, display_name, full_name, created_at, updated_at)
SELECT 
    'ckumlama@gmail.com',
    'admin',
    'CK Umlama',
    'CK Umlama',
    now(),
    now()
WHERE NOT EXISTS (
    SELECT 1 FROM profiles WHERE email = 'ckumlama@gmail.com'
);

-- Güncelleme sonucunu kontrol et
SELECT 
    id,
    email,
    display_name,
    full_name,
    role,
    created_at,
    updated_at
FROM profiles 
WHERE email = 'ckumlama@gmail.com';
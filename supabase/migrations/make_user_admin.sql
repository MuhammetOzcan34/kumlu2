-- En son kayıtlı kullanıcıyı admin yap
-- Önce mevcut durumu kontrol et
SELECT 
  au.email,
  p.role,
  p.display_name,
  p.full_name
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
ORDER BY au.created_at DESC
LIMIT 1;

-- En son kayıtlı kullanıcının role'ünü admin yap
UPDATE profiles 
SET role = 'admin', 
    updated_at = now()
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Kullanici_rolleri tablosuna da admin kaydı ekle (eğer yoksa)
INSERT INTO kullanici_rolleri (email, role, is_super_admin)
SELECT 
  au.email,
  'admin',
  true
FROM auth.users au
WHERE au.id = (
  SELECT id 
  FROM auth.users 
  ORDER BY created_at DESC 
  LIMIT 1
)
ON CONFLICT (email) DO UPDATE SET 
  role = 'admin',
  is_super_admin = true;

-- Sonucu kontrol et
SELECT 
  au.email,
  p.role as profile_role,
  kr.role as kullanici_rolleri_role,
  kr.is_super_admin
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
LEFT JOIN kullanici_rolleri kr ON au.email = kr.email
ORDER BY au.created_at DESC
LIMIT 1;
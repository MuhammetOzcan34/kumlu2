-- En son kayıtlı kullanıcıyı admin rolüne yükselt
-- Bu işlem giriş yapan kullanıcının admin yetkisi almasını sağlar

-- Önce mevcut durumu kontrol et
SELECT 
  au.id,
  au.email,
  p.role,
  p.display_name,
  au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
ORDER BY au.created_at DESC
LIMIT 3;

-- En son kayıtlı kullanıcının profiles tablosundaki role'ünü admin yap
UPDATE profiles 
SET role = 'admin'
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  ORDER BY created_at DESC 
  LIMIT 1
);

-- Eğer kullanıcının profili yoksa oluştur ve admin yap
INSERT INTO profiles (id, user_id, display_name, role, email)
SELECT 
  au.id,
  au.id,
  COALESCE(au.raw_user_meta_data->>'display_name', split_part(au.email, '@', 1)),
  'admin',
  au.email
FROM auth.users au
WHERE au.id NOT IN (SELECT user_id FROM profiles WHERE user_id IS NOT NULL)
ORDER BY au.created_at DESC
LIMIT 1
ON CONFLICT (user_id) DO UPDATE SET role = 'admin';

-- kullanici_rolleri tablosuna da ekle (eğer yoksa)
INSERT INTO kullanici_rolleri (email, role, is_super_admin)
SELECT 
  au.email,
  'admin',
  true
FROM auth.users au
WHERE au.email NOT IN (SELECT email FROM kullanici_rolleri WHERE email IS NOT NULL)
ORDER BY au.created_at DESC
LIMIT 1
ON CONFLICT (email) DO UPDATE SET 
  role = 'admin',
  is_super_admin = true;

-- Sonucu kontrol et
SELECT 
  au.id,
  au.email,
  p.role as profile_role,
  kr.role as kullanici_rolleri_role,
  kr.is_super_admin,
  au.created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
LEFT JOIN kullanici_rolleri kr ON au.email = kr.email
ORDER BY au.created_at DESC
LIMIT 3;
-- Auth tablosundaki kullanıcıları ve profiles ile birleştir
SELECT 
  au.id as auth_user_id,
  au.email as auth_email,
  au.created_at as auth_created_at,
  p.id as profile_id,
  p.email as profile_email,
  p.display_name,
  p.full_name,
  p.role,
  p.created_at as profile_created_at
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
ORDER BY au.created_at DESC;
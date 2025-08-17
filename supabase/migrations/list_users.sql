-- Mevcut kullanıcıları listele
SELECT 
  p.id,
  p.user_id,
  p.email,
  p.display_name,
  p.full_name,
  p.role,
  p.created_at
FROM profiles p
ORDER BY p.created_at DESC;
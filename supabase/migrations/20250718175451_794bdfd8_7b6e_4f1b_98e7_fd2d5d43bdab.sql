-- İlk admin kullanıcı için profil oluşturma
-- Bu geçici bir çözüm, gerçek projede admin kullanıcı manuel olarak belirlenmelidir

-- Eğer admin@example.com kullanıcısı varsa admin yap
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'admin@example.com'
);

-- Eğer hiç admin yoksa, ilk kayıt olan kullanıcıyı admin yap
-- (Geliştirme amaçlı)
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = (
  SELECT id FROM public.profiles 
  ORDER BY created_at ASC 
  LIMIT 1
) 
AND NOT EXISTS (
  SELECT 1 FROM public.profiles WHERE role = 'admin'
);
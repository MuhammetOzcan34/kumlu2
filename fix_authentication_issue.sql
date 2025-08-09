-- Authentication sonrası boş sayfa problemini çözmek için
-- 1. Profiles tablosunun yapısını kontrol et
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 2. Mevcut kullanıcıları ve profillerini kontrol et
SELECT 
    u.id as user_id,
    u.email,
    u.email_confirmed_at,
    p.id as profile_id,
    p.display_name,
    p.role,
    p.created_at
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.user_id
ORDER BY u.created_at DESC;

-- 3. Eksik profilleri oluştur
INSERT INTO public.profiles (id, user_id, display_name, role)
SELECT 
    u.id,
    u.id,
    COALESCE(u.raw_user_meta_data->>'display_name', u.email),
    CASE 
        WHEN u.email = 'ckumlama@gmail.com' THEN 'admin'
        ELSE 'user'
    END
FROM auth.users u
WHERE NOT EXISTS (
    SELECT 1 FROM public.profiles p WHERE p.user_id = u.id
);

-- 4. RLS politikalarını düzelt
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları temizle ve yeniden oluştur
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;

-- Yeni politikalar
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (
  EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE user_id = auth.uid() 
    AND role = 'admin'
  )
);

-- 5. Handle new user trigger'ını güncelle
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Mevcut kullanıcı sayısını kontrol et
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Eğer bu ilk kullanıcıysa veya email ckumlama@gmail.com ise admin yap
  IF user_count = 0 OR NEW.email = 'ckumlama@gmail.com' THEN
    INSERT INTO public.profiles (id, user_id, display_name, role)
    VALUES (NEW.id, NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), 'admin');
  ELSE
    INSERT INTO public.profiles (id, user_id, display_name, role)
    VALUES (NEW.id, NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), 'user');
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger'ı yeniden oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 6. Mevcut kullanıcının admin olduğundan emin ol
UPDATE public.profiles 
SET role = 'admin' 
WHERE user_id IN (
  SELECT id FROM auth.users WHERE email = 'ckumlama@gmail.com'
);

-- 7. Sonuçları kontrol et
SELECT 'Profiles tablosu durumu:' as info;
SELECT 
    u.email,
    p.display_name,
    p.role,
    p.created_at
FROM auth.users u
JOIN public.profiles p ON u.id = p.user_id
ORDER BY p.created_at DESC;
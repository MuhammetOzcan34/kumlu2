-- ========================================
-- PROFILES TABLOSU DÜZELTME
-- ========================================

-- 1. Eksik sütunları ekle
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS email TEXT;

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS full_name TEXT;

-- 2. Mevcut kullanıcıların email bilgilerini auth.users tablosundan al
UPDATE public.profiles 
SET email = auth_users.email,
    full_name = COALESCE(auth_users.raw_user_meta_data->>'full_name', auth_users.email)
FROM auth.users auth_users
WHERE public.profiles.user_id = auth_users.id
AND public.profiles.email IS NULL;

-- 3. Trigger fonksiyonunu güncelle
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, user_id, email, full_name, display_name, role)
  VALUES (
    NEW.id, 
    NEW.id, 
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
    COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email), 
    'user'
  );
  RETURN NEW;
EXCEPTION
  WHEN others THEN
    -- Hata durumunda bile trigger başarılı olsun
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. Trigger'ı yeniden oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 5. Tabloyu kontrol et
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- 6. Verileri kontrol et
SELECT 
    id,
    user_id,
    email,
    full_name,
    display_name,
    role,
    created_at
FROM public.profiles
ORDER BY created_at DESC;
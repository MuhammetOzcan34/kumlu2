-- JWT token'da role bilgisinin taşınması için custom claims setup
-- Bu migration JWT token'a role bilgisini ekler

-- 1. Custom claims için function oluştur
CREATE OR REPLACE FUNCTION public.custom_access_token_hook(event jsonb)
RETURNS jsonb
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  claims jsonb;
  user_role text;
  user_email text;
BEGIN
  -- Mevcut claims'i al
  claims := event->'claims';
  
  -- Kullanıcı email'ini al
  user_email := event->'user_id';
  
  -- Önce raw_app_meta_data'dan role kontrol et
  SELECT (raw_app_meta_data->>'role') INTO user_role
  FROM auth.users 
  WHERE id = (event->>'user_id')::uuid;
  
  -- Eğer raw_app_meta_data'da role yoksa kullanici_rolleri tablosundan al
  IF user_role IS NULL THEN
    SELECT kr.role INTO user_role
    FROM public.kullanici_rolleri kr
    JOIN auth.users au ON au.email = kr.email
    WHERE au.id = (event->>'user_id')::uuid;
  END IF;
  
  -- Eğer hala role yoksa profiles tablosundan al
  IF user_role IS NULL THEN
    SELECT p.role INTO user_role
    FROM public.profiles p
    WHERE p.user_id = (event->>'user_id')::uuid;
  END IF;
  
  -- Varsayılan role
  IF user_role IS NULL THEN
    user_role := 'user';
  END IF;
  
  -- Role'ü claims'e ekle
  claims := jsonb_set(claims, '{role}', to_jsonb(user_role));
  
  -- Güncellenmiş event'i döndür
  RETURN jsonb_set(event, '{claims}', claims);
END;
$$;

-- 2. Function'ı auth hook olarak kaydet
-- NOT: Bu kısım Supabase Dashboard'dan manuel olarak yapılmalı
-- Dashboard > Authentication > Hooks > Custom Access Token Hook
-- Function: public.custom_access_token_hook

-- 3. Mevcut kullanıcılar için raw_app_meta_data güncelle
UPDATE auth.users 
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'),
  '{role}',
  to_jsonb(COALESCE(
    (SELECT kr.role FROM public.kullanici_rolleri kr WHERE kr.email = auth.users.email),
    (SELECT p.role FROM public.profiles p WHERE p.user_id = auth.users.id),
    'user'
  )),
  true
)
WHERE raw_app_meta_data->>'role' IS NULL;

-- 4. Trigger oluştur: kullanici_rolleri tablosu güncellendiğinde raw_app_meta_data'yı güncelle
CREATE OR REPLACE FUNCTION public.sync_user_role_to_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Kullanıcının raw_app_meta_data'sını güncelle
  UPDATE auth.users 
  SET raw_app_meta_data = jsonb_set(
    COALESCE(raw_app_meta_data, '{}'),
    '{role}',
    to_jsonb(NEW.role),
    true
  )
  WHERE email = NEW.email;
  
  RETURN NEW;
END;
$$;

-- Trigger'ı kullanici_rolleri tablosuna ekle
DROP TRIGGER IF EXISTS sync_role_to_metadata ON public.kullanici_rolleri;
CREATE TRIGGER sync_role_to_metadata
  AFTER INSERT OR UPDATE OF role ON public.kullanici_rolleri
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_user_role_to_metadata();

-- 5. Profiles tablosu için de benzer trigger
CREATE OR REPLACE FUNCTION public.sync_profile_role_to_metadata()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Eğer kullanici_rolleri tablosunda bu kullanıcı yoksa profiles'dan güncelle
  IF NOT EXISTS (SELECT 1 FROM public.kullanici_rolleri kr JOIN auth.users au ON au.email = kr.email WHERE au.id = NEW.user_id) THEN
    UPDATE auth.users 
    SET raw_app_meta_data = jsonb_set(
      COALESCE(raw_app_meta_data, '{}'),
      '{role}',
      to_jsonb(NEW.role),
      true
    )
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Trigger'ı profiles tablosuna ekle
DROP TRIGGER IF EXISTS sync_profile_role_to_metadata ON public.profiles;
CREATE TRIGGER sync_profile_role_to_metadata
  AFTER INSERT OR UPDATE OF role ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.sync_profile_role_to_metadata();
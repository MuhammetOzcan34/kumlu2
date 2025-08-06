-- İlk kullanıcıyı admin olarak ayarlayan trigger güncelle
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  user_count INTEGER;
BEGIN
  -- Mevcut kullanıcı sayısını kontrol et
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Eğer bu ilk kullanıcıysa veya email ckumlama@gmail.com ise admin yap
  IF user_count = 0 OR NEW.email = 'ckumlama@gmail.com' THEN
    INSERT INTO public.profiles (user_id, display_name, role)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name', 'admin');
  ELSE
    INSERT INTO public.profiles (user_id, display_name, role)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name', 'user');
  END IF;
  
  RETURN NEW;
END;
$$;
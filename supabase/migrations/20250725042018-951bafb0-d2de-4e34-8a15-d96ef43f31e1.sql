-- Güvenlik açığı düzeltmesi: search_path güvenliği
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
 RETURNS text
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path = ''
AS $function$
  SELECT role FROM public.profiles WHERE user_id = user_uuid LIMIT 1;
$function$;

-- Handle new user fonksiyonunu güvenli hale getir
CREATE OR REPLACE FUNCTION public.handle_new_user()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path = ''
AS $function$
DECLARE
  user_count INTEGER;
BEGIN
  -- Mevcut kullanıcı sayısını kontrol et
  SELECT COUNT(*) INTO user_count FROM public.profiles;
  
  -- Eğer bu ilk kullanıcıysa admin yap, yoksa normal user
  IF user_count = 0 THEN
    INSERT INTO public.profiles (user_id, display_name, role)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name', 'admin');
  ELSE
    INSERT INTO public.profiles (user_id, display_name, role)
    VALUES (NEW.id, NEW.raw_user_meta_data ->> 'display_name', 'user');
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Kullanıcıların kendi rollerini değiştiremeyeceği güvenli policy
CREATE OR REPLACE FUNCTION public.prevent_role_change()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $function$
BEGIN
  -- Sadece adminler rol değiştirebilir
  IF OLD.role != NEW.role AND public.get_user_role(auth.uid()) != 'admin' THEN
    RAISE EXCEPTION 'Sadece adminler rol değiştirebilir';
  END IF;
  RETURN NEW;
END;
$function$;

-- Trigger ekle
DROP TRIGGER IF EXISTS prevent_unauthorized_role_change ON public.profiles;
CREATE TRIGGER prevent_unauthorized_role_change
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.prevent_role_change();
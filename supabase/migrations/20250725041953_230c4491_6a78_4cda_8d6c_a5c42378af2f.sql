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

-- Rol güvenliği: Kullanıcıların kendi rollerini değiştiremeyeceği yeni policy
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;

CREATE POLICY "Users can update their own profile (except role)" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
  auth.uid() = user_id AND 
  -- Kullanıcı kendi rolünü değiştirmeye çalışıyorsa engelle
  (OLD.role = NEW.role OR public.get_user_role(auth.uid()) = 'admin')
);
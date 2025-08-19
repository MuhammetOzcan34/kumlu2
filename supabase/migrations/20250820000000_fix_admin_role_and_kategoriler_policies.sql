-- Admin rol kontrolü için get_user_role fonksiyonunu standartlaştırma
CREATE OR REPLACE FUNCTION public.get_user_role(user_id uuid)
 RETURNS text
 LANGUAGE plpgsql
AS $function$
DECLARE
  user_role text;
BEGIN
  SELECT role INTO user_role FROM public.profiles WHERE user_id = $1;
  RETURN user_role;
EXCEPTION
  WHEN OTHERS THEN
    RETURN 'user';
END;
$function$;

-- Kategoriler tablosu için tüm mevcut politikaları kaldır
DROP POLICY IF EXISTS "Kategoriler herkese görünür" ON public.kategoriler;
DROP POLICY IF EXISTS "Admin tam erişim" ON public.kategoriler;
DROP POLICY IF EXISTS "Admin kategorileri yönetebilir" ON public.kategoriler;
DROP POLICY IF EXISTS "Kullanıcılar kategorileri görebilir" ON public.kategoriler;
DROP POLICY IF EXISTS "Admin kategorileri ekleyebilir" ON public.kategoriler;
DROP POLICY IF EXISTS "Admin kategorileri düzenleyebilir" ON public.kategoriler;
DROP POLICY IF EXISTS "Admin kategorileri silebilir" ON public.kategoriler;

-- Kategoriler tablosu için minimal policy seti
-- 1. Herkes kategorileri görebilir (SELECT)
CREATE POLICY "Kategoriler herkese görünür" ON public.kategoriler
  FOR SELECT
  TO authenticated, anon
  USING (true);

-- 2. Admin tüm CRUD işlemlerini yapabilir
CREATE POLICY "Admin kategorileri yönetebilir" ON public.kategoriler
  FOR ALL
  TO authenticated
  USING (public.get_user_role(auth.uid()) = 'admin');

-- RLS'i etkinleştir
ALTER TABLE public.kategoriler ENABLE ROW LEVEL SECURITY;
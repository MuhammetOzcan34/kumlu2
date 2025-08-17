-- Admin'in tüm kullanıcıları yönetme yetkisi migrasyonu
-- GitHub referansı: 20230901112200_admin_can_manage_all_users.sql
-- Bu migrasyon admin rolüne tüm kullanıcıları görme/düzenleme yetkisi verir

-- User_roles tablosu için RLS'yi etkinleştir ve admin policy'leri ekle
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Mevcut user_roles policy'lerini temizle
DROP POLICY IF EXISTS "Admin can view all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Admin can manage all user roles" ON public.user_roles;
DROP POLICY IF EXISTS "Users can view own role" ON public.user_roles;

-- Kullanıcılar kendi rollerini görebilir
CREATE POLICY "Users can view own role" ON public.user_roles
  FOR SELECT USING (
    user_id = auth.uid()
  );

-- Admin tüm kullanıcı rollerini görebilir
CREATE POLICY "Admin can view all user roles" ON public.user_roles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

-- Admin tüm kullanıcı rollerini yönetebilir
CREATE POLICY "Admin can manage all user roles" ON public.user_roles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

-- Admin fonksiyonları oluştur
-- Admin kullanıcıları listeleme fonksiyonu
CREATE OR REPLACE FUNCTION public.admin_list_users()
RETURNS TABLE (
  user_id uuid,
  email text,
  display_name text,
  role text,
  created_at timestamptz,
  last_sign_in_at timestamptz
)
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
BEGIN
  -- Admin yetkisi kontrolü
  IF NOT EXISTS (
    SELECT 1 FROM public.kullanici_rolleri kr
    WHERE kr.email = auth.email() AND kr.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Bu işlem için admin yetkisi gereklidir.';
  END IF;

  -- Tüm kullanıcıları listele
  RETURN QUERY
  SELECT 
    au.id as user_id,
    au.email::text,
    COALESCE(p.display_name, au.email)::text as display_name,
    COALESCE(p.role, 'user')::text as role,
    au.created_at,
    au.last_sign_in_at
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.user_id
  ORDER BY au.created_at DESC;
END;
$$;

-- Admin kullanıcı rolü güncelleme fonksiyonu
CREATE OR REPLACE FUNCTION public.admin_update_user_role(
  target_user_id uuid,
  new_role text
)
RETURNS boolean
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  target_email text;
BEGIN
  -- Admin yetkisi kontrolü
  IF NOT EXISTS (
    SELECT 1 FROM public.kullanici_rolleri kr
    WHERE kr.email = auth.email() AND kr.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Bu işlem için admin yetkisi gereklidir.';
  END IF;

  -- Geçerli rol kontrolü
  IF new_role NOT IN ('user', 'admin', 'manager') THEN
    RAISE EXCEPTION 'Geçersiz rol: %', new_role;
  END IF;

  -- Hedef kullanıcının email'ini al
  SELECT email INTO target_email
  FROM auth.users
  WHERE id = target_user_id;

  IF target_email IS NULL THEN
    RAISE EXCEPTION 'Kullanıcı bulunamadı.';
  END IF;

  -- Profiles tablosunu güncelle
  UPDATE public.profiles
  SET role = new_role, updated_at = now()
  WHERE user_id = target_user_id;

  -- Kullanici_rolleri tablosunu güncelle
  INSERT INTO public.kullanici_rolleri (email, role, is_super_admin)
  VALUES (target_email, new_role, (new_role = 'admin'))
  ON CONFLICT (email) DO UPDATE SET
    role = EXCLUDED.role,
    is_super_admin = EXCLUDED.is_super_admin;

  RETURN true;
END;
$$;

-- Admin kullanıcı silme fonksiyonu
CREATE OR REPLACE FUNCTION public.admin_delete_user(
  target_user_id uuid
)
RETURNS boolean
SECURITY DEFINER
LANGUAGE plpgsql
AS $$
DECLARE
  target_email text;
BEGIN
  -- Admin yetkisi kontrolü
  IF NOT EXISTS (
    SELECT 1 FROM public.kullanici_rolleri kr
    WHERE kr.email = auth.email() AND kr.role = 'admin'
  ) THEN
    RAISE EXCEPTION 'Bu işlem için admin yetkisi gereklidir.';
  END IF;

  -- Hedef kullanıcının email'ini al
  SELECT email INTO target_email
  FROM auth.users
  WHERE id = target_user_id;

  IF target_email IS NULL THEN
    RAISE EXCEPTION 'Kullanıcı bulunamadı.';
  END IF;

  -- İlişkili kayıtları temizle
  DELETE FROM public.profiles WHERE user_id = target_user_id;
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  DELETE FROM public.kullanici_rolleri WHERE email = target_email;

  RETURN true;
END;
$$;

-- Fonksiyonlara gerekli izinleri ver
GRANT EXECUTE ON FUNCTION public.admin_list_users() TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_update_user_role(uuid, text) TO authenticated;
GRANT EXECUTE ON FUNCTION public.admin_delete_user(uuid) TO authenticated;

-- Başarı mesajı
-- Admin kullanıcı yönetim yetkileri ve fonksiyonları başarıyla oluşturuldu.
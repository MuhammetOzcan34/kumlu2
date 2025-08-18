-- Profiles tablosu RLS policy'lerini düzelt
-- 403 Forbidden hatasını çözmek için gerekli policy'leri ekle

-- 1. Mevcut policy'leri temizle
DROP POLICY IF EXISTS "profiles_read_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_read_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_update_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_insert_all" ON public.profiles;
DROP POLICY IF EXISTS "profiles_delete_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_delete_all" ON public.profiles;

-- 2. RLS'yi aktif et (zaten aktif ama emin olmak için)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 3. SELECT Policy'leri - Kullanıcı kendi profilini görebilsin
CREATE POLICY "profiles_read_own" ON public.profiles
  FOR SELECT TO authenticated
  USING (auth.uid() = user_id);

-- 4. SELECT Policy'leri - Admin tüm profilleri görebilsin
CREATE POLICY "profiles_admin_read_all" ON public.profiles
  FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- 5. UPDATE Policy'leri - Kullanıcı kendi profilini güncelleyebilsin
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. UPDATE Policy'leri - Admin tüm profilleri güncelleyebilsin
CREATE POLICY "profiles_admin_update_all" ON public.profiles
  FOR UPDATE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- 7. INSERT Policy'leri - Kullanıcı kendi profilini oluşturabilsin
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = user_id);

-- 8. INSERT Policy'leri - Admin herhangi bir profil oluşturabilsin
CREATE POLICY "profiles_admin_insert_all" ON public.profiles
  FOR INSERT TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- 9. DELETE Policy'leri - Kullanıcı kendi profilini silebilsin
CREATE POLICY "profiles_delete_own" ON public.profiles
  FOR DELETE TO authenticated
  USING (auth.uid() = user_id);

-- 10. DELETE Policy'leri - Admin tüm profilleri silebilsin
CREATE POLICY "profiles_admin_delete_all" ON public.profiles
  FOR DELETE TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles p
      WHERE p.user_id = auth.uid() AND p.role = 'admin'
    )
  );

-- 11. Anon kullanıcılar için temel okuma izni (public profiller için)
GRANT SELECT ON public.profiles TO anon;
GRANT SELECT ON public.profiles TO authenticated;

-- 12. Authenticated kullanıcılar için CRUD izinleri
GRANT INSERT, UPDATE, DELETE ON public.profiles TO authenticated;

-- 13. user_id kolonunun NOT NULL olmasını sağla (veri tutarlılığı için)
-- Bu işlem mevcut NULL değerler varsa hata verebilir, dikkatli olun
-- ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;

-- 14. Trigger fonksiyonu - updated_at otomatik güncelleme
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 15. Trigger oluştur
DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- 16. İndeks oluştur - performans için
CREATE INDEX IF NOT EXISTS profiles_user_id_idx ON public.profiles(user_id);
CREATE INDEX IF NOT EXISTS profiles_role_idx ON public.profiles(role);
CREATE INDEX IF NOT EXISTS profiles_email_idx ON public.profiles(email);

-- Migration tamamlandı
-- Bu migration 403 Forbidden hatalarını çözmeli
-- Kullanıcılar kendi profillerini görebilir/düzenleyebilir
-- Admin'ler tüm profilleri yönetebilir
-- =====================================================
-- FULL ADMIN REPAIR MIGRATION
-- Tüm sistemsel sorunları çözen kapsamlı migration
-- Tarih: 2025-01-18
-- =====================================================

-- =====================================================
-- 1. AYARLAR TABLOSU DÜZELTMELERI
-- =====================================================

-- RLS'yi aktif et
ALTER TABLE public.ayarlar ENABLE ROW LEVEL SECURITY;

-- Mevcut policy'leri temizle
DROP POLICY IF EXISTS ayarlar_read_all ON public.ayarlar;
DROP POLICY IF EXISTS ayarlar_admin_crud ON public.ayarlar;
DROP POLICY IF EXISTS ayarlar_insert_policy ON public.ayarlar;
DROP POLICY IF EXISTS ayarlar_update_policy ON public.ayarlar;
DROP POLICY IF EXISTS ayarlar_delete_policy ON public.ayarlar;

-- Herkes okuyabilir policy'si
CREATE POLICY ayarlar_read_all ON public.ayarlar 
FOR SELECT 
USING (true);

-- Admin tüm işlemleri yapabilir
CREATE POLICY ayarlar_admin_crud ON public.ayarlar 
FOR ALL TO authenticated 
USING (
  auth.jwt() ->> 'role' = 'admin' OR 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
) 
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin' OR 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- UNIQUE constraint ekle (eğer yoksa)
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'ayarlar' 
    AND constraint_type = 'UNIQUE' 
    AND constraint_name = 'ayarlar_anahtar_unique'
  ) THEN 
    ALTER TABLE public.ayarlar ADD CONSTRAINT ayarlar_anahtar_unique UNIQUE (anahtar); 
  END IF; 
END $$;

-- =====================================================
-- 2. FOTOGRAFLAR TABLOSU DÜZELTMELERI
-- =====================================================

-- RLS'yi aktif et
ALTER TABLE public.fotograflar ENABLE ROW LEVEL SECURITY;

-- Mevcut policy'leri temizle
DROP POLICY IF EXISTS fotograflar_read_slider ON public.fotograflar;
DROP POLICY IF EXISTS fotograflar_admin_crud ON public.fotograflar;
DROP POLICY IF EXISTS fotograflar_read_all ON public.fotograflar;
DROP POLICY IF EXISTS fotograflar_insert_policy ON public.fotograflar;
DROP POLICY IF EXISTS fotograflar_update_policy ON public.fotograflar;
DROP POLICY IF EXISTS fotograflar_delete_policy ON public.fotograflar;

-- Aktif slider fotoğrafları herkes okuyabilir
CREATE POLICY fotograflar_read_slider ON public.fotograflar 
FOR SELECT TO authenticated 
USING (
  aktif = true AND (
    gorsel_tipi = 'slider' OR 
    kullanim_alani @> ARRAY['ana-sayfa-slider'] OR
    kullanim_alani @> ARRAY['slider']
  )
);

-- Anonim kullanıcılar da slider'ları görebilir
CREATE POLICY fotograflar_read_slider_anon ON public.fotograflar 
FOR SELECT TO anon 
USING (
  aktif = true AND (
    gorsel_tipi = 'slider' OR 
    kullanim_alani @> ARRAY['ana-sayfa-slider'] OR
    kullanim_alani @> ARRAY['slider']
  )
);

-- Admin tüm işlemleri yapabilir
CREATE POLICY fotograflar_admin_crud ON public.fotograflar 
FOR ALL TO authenticated 
USING (
  auth.jwt() ->> 'role' = 'admin' OR 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
) 
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin' OR 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- =====================================================
-- 3. PROFILES TABLOSU DÜZELTMELERI
-- =====================================================

-- RLS'yi aktif et
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Mevcut policy'leri temizle
DROP POLICY IF EXISTS profiles_read_own ON public.profiles;
DROP POLICY IF EXISTS profiles_admin_read_all ON public.profiles;
DROP POLICY IF EXISTS profiles_update_own ON public.profiles;
DROP POLICY IF EXISTS profiles_insert_own ON public.profiles;
DROP POLICY IF EXISTS profiles_delete_policy ON public.profiles;

-- Kullanıcı kendi profilini okuyabilir
CREATE POLICY profiles_read_own ON public.profiles 
FOR SELECT TO authenticated 
USING (auth.uid() = user_id);

-- Kullanıcı kendi profilini güncelleyebilir
CREATE POLICY profiles_update_own ON public.profiles 
FOR UPDATE TO authenticated 
USING (auth.uid() = user_id) 
WITH CHECK (auth.uid() = user_id);

-- Kullanıcı kendi profilini oluşturabilir
CREATE POLICY profiles_insert_own ON public.profiles 
FOR INSERT TO authenticated 
WITH CHECK (auth.uid() = user_id);

-- Admin tüm profilleri görebilir ve yönetebilir
CREATE POLICY profiles_admin_read_all ON public.profiles 
FOR SELECT TO authenticated 
USING (
  auth.jwt() ->> 'role' = 'admin' OR 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

CREATE POLICY profiles_admin_crud ON public.profiles 
FOR ALL TO authenticated 
USING (
  auth.jwt() ->> 'role' = 'admin' OR 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
) 
WITH CHECK (
  auth.jwt() ->> 'role' = 'admin' OR 
  (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
);

-- =====================================================
-- 4. STORAGE BUCKET POLICY'LERI
-- =====================================================

-- Fotograflar bucket'ı için okuma izni (herkes)
INSERT INTO storage.buckets (id, name, public) 
VALUES ('fotograflar', 'fotograflar', true) 
ON CONFLICT (id) DO UPDATE SET public = true;

-- Storage policy'leri temizle
DROP POLICY IF EXISTS "fotograflar_read_all" ON storage.objects;
DROP POLICY IF EXISTS "fotograflar_admin_upload" ON storage.objects;
DROP POLICY IF EXISTS "fotograflar_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "fotograflar_admin_delete" ON storage.objects;

-- Herkes fotografları okuyabilir
CREATE POLICY "fotograflar_read_all" ON storage.objects 
FOR SELECT 
USING (bucket_id = 'fotograflar');

-- Admin fotografları yükleyebilir
CREATE POLICY "fotograflar_admin_upload" ON storage.objects 
FOR INSERT TO authenticated 
WITH CHECK (
  bucket_id = 'fotograflar' AND (
    auth.jwt() ->> 'role' = 'admin' OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
);

-- Admin fotografları güncelleyebilir
CREATE POLICY "fotograflar_admin_update" ON storage.objects 
FOR UPDATE TO authenticated 
USING (
  bucket_id = 'fotograflar' AND (
    auth.jwt() ->> 'role' = 'admin' OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
) 
WITH CHECK (
  bucket_id = 'fotograflar' AND (
    auth.jwt() ->> 'role' = 'admin' OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
);

-- Admin fotografları silebilir
CREATE POLICY "fotograflar_admin_delete" ON storage.objects 
FOR DELETE TO authenticated 
USING (
  bucket_id = 'fotograflar' AND (
    auth.jwt() ->> 'role' = 'admin' OR 
    (auth.jwt() -> 'user_metadata' ->> 'role') = 'admin'
  )
);

-- =====================================================
-- 5. İZİNLER VE ROLLER
-- =====================================================

-- Anon role'e gerekli izinleri ver
GRANT SELECT ON public.ayarlar TO anon;
GRANT SELECT ON public.fotograflar TO anon;
GRANT SELECT ON storage.objects TO anon;

-- Authenticated role'e gerekli izinleri ver
GRANT ALL PRIVILEGES ON public.ayarlar TO authenticated;
GRANT ALL PRIVILEGES ON public.fotograflar TO authenticated;
GRANT ALL PRIVILEGES ON public.profiles TO authenticated;
GRANT ALL PRIVILEGES ON storage.objects TO authenticated;
GRANT ALL PRIVILEGES ON storage.buckets TO authenticated;

-- =====================================================
-- 6. KONTROL VE DOĞRULAMA
-- =====================================================

-- Tabloların RLS durumunu kontrol et
SELECT 
  schemaname,
  tablename,
  rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('ayarlar', 'fotograflar', 'profiles');

-- Policy'leri kontrol et
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('ayarlar', 'fotograflar', 'profiles')
ORDER BY tablename, policyname;

-- İzinleri kontrol et
SELECT 
  grantee,
  table_name,
  privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated') 
AND table_name IN ('ayarlar', 'fotograflar', 'profiles')
ORDER BY table_name, grantee;

-- Migration tamamlandı mesajı
SELECT 'Full Admin Repair Migration başarıyla tamamlandı!' as migration_status;
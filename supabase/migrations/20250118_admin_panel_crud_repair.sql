-- Admin Panel CRUD İşlemleri Onarım Migration
-- Tarih: 2025-01-18
-- Amaç: Ayarlar, fotograflar ve kategoriler tablolarının RLS politikalarını ve CRUD yetkilerini düzeltmek

-- Ayarlar tablosu: UNIQUE constraint ve CRUD policy
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_name = 'ayarlar' AND constraint_type = 'UNIQUE'
  ) THEN
    ALTER TABLE public.ayarlar ADD CONSTRAINT ayarlar_anahtar_unique UNIQUE (anahtar);
  END IF;
END $$;



-- Auth role fonksiyonu yerine public schema'da oluştur
CREATE OR REPLACE FUNCTION public.get_user_role()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
AS $$
  SELECT COALESCE(
    (SELECT role FROM public.kullanici_rolleri WHERE user_id = auth.uid()),
    'user'
  );
$$;

-- Ayarlar tablosu RLS etkinleştir
ALTER TABLE public.ayarlar ENABLE ROW LEVEL SECURITY;

-- Ayarlar tablosu: Herkese okuma izni
DROP POLICY IF EXISTS ayarlar_read_all ON public.ayarlar;
CREATE POLICY ayarlar_read_all ON public.ayarlar FOR SELECT USING (true);

-- Ayarlar tablosu: Admin kullanıcılar için tam CRUD yetkisi
DROP POLICY IF EXISTS ayarlar_admin_crud ON public.ayarlar;
CREATE POLICY ayarlar_admin_crud ON public.ayarlar
FOR ALL TO authenticated
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

-- Fotograflar tablosu: RLS etkinleştir
ALTER TABLE public.fotograflar ENABLE ROW LEVEL SECURITY;

-- Fotograflar tablosu: Herkese okuma izni
DROP POLICY IF EXISTS fotograflar_read_all ON public.fotograflar;
CREATE POLICY fotograflar_read_all ON public.fotograflar FOR SELECT USING (true);

-- Fotograflar tablosu: Admin kullanıcılar için tam CRUD yetkisi
DROP POLICY IF EXISTS fotograflar_admin_crud ON public.fotograflar;
CREATE POLICY fotograflar_admin_crud ON public.fotograflar
FOR ALL TO authenticated
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

-- Kategoriler tablosu: RLS etkinleştir
ALTER TABLE public.kategoriler ENABLE ROW LEVEL SECURITY;

-- Kategoriler tablosu: Herkese okuma izni
DROP POLICY IF EXISTS kategoriler_read_all ON public.kategoriler;
CREATE POLICY kategoriler_read_all ON public.kategoriler FOR SELECT USING (true);

-- Kategoriler tablosu: Admin kullanıcılar için tam CRUD yetkisi
DROP POLICY IF EXISTS kategoriler_admin_crud ON public.kategoriler;
CREATE POLICY kategoriler_admin_crud ON public.kategoriler
FOR ALL TO authenticated
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

-- Storage bucket policy: Admin kullanıcılar için upload yetkisi
DROP POLICY IF EXISTS allow_admin_uploads ON storage.objects;
CREATE POLICY allow_admin_uploads ON storage.objects
FOR INSERT TO authenticated
WITH CHECK (public.get_user_role() = 'admin');

-- Storage bucket policy: Admin kullanıcılar için update yetkisi
DROP POLICY IF EXISTS allow_admin_updates ON storage.objects;
CREATE POLICY allow_admin_updates ON storage.objects
FOR UPDATE TO authenticated
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

-- Storage bucket policy: Admin kullanıcılar için delete yetkisi
DROP POLICY IF EXISTS allow_admin_deletes ON storage.objects;
CREATE POLICY allow_admin_deletes ON storage.objects
FOR DELETE TO authenticated
USING (public.get_user_role() = 'admin');

-- Storage bucket policy: Herkese okuma izni
DROP POLICY IF EXISTS allow_public_read ON storage.objects;
CREATE POLICY allow_public_read ON storage.objects
FOR SELECT USING (true);

-- Kullanıcı rolleri tablosu için RLS politikası
ALTER TABLE public.kullanici_rolleri ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS kullanici_rolleri_read_own ON public.kullanici_rolleri;
CREATE POLICY kullanici_rolleri_read_own ON public.kullanici_rolleri
FOR SELECT TO authenticated
USING (user_id = auth.uid() OR public.get_user_role() = 'admin');

DROP POLICY IF EXISTS kullanici_rolleri_admin_crud ON public.kullanici_rolleri;
CREATE POLICY kullanici_rolleri_admin_crud ON public.kullanici_rolleri
FOR ALL TO authenticated
USING (public.get_user_role() = 'admin')
WITH CHECK (public.get_user_role() = 'admin');

-- Anon ve authenticated rollere gerekli izinleri ver
GRANT SELECT ON public.ayarlar TO anon;
GRANT ALL PRIVILEGES ON public.ayarlar TO authenticated;

GRANT SELECT ON public.fotograflar TO anon;
GRANT ALL PRIVILEGES ON public.fotograflar TO authenticated;

GRANT SELECT ON public.kategoriler TO anon;
GRANT ALL PRIVILEGES ON public.kategoriler TO authenticated;

GRANT SELECT ON public.kullanici_rolleri TO anon;
GRANT ALL PRIVILEGES ON public.kullanici_rolleri TO authenticated;

-- Storage bucket'a gerekli izinleri ver
GRANT ALL ON storage.objects TO authenticated;
GRANT SELECT ON storage.objects TO anon;

-- Migration tamamlandı mesajı
SELECT 'Admin Panel CRUD onarım migration başarıyla tamamlandı!' as message;
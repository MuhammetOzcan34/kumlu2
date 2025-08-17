-- Admin rolünü tanımla (varsa atla)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM auth.users WHERE email = 'admin@kumlu2.com'
  ) THEN
    INSERT INTO auth.users (id, email, encrypted_password)
    VALUES (gen_random_uuid(), 'admin@kumlu2.com', crypt('admin123', gen_salt('bf')));
  END IF;
END $$;

-- RLS aktif et
ALTER TABLE public.ayarlar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fotograflar ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reklam_kampanyalari ENABLE ROW LEVEL SECURITY;

-- Ayarlar tablosu için admin policy
DROP POLICY IF EXISTS admin_select_ayarlar ON public.ayarlar;
CREATE POLICY admin_select_ayarlar ON public.ayarlar
  FOR SELECT USING (
    auth.role() = 'admin'
  );

DROP POLICY IF EXISTS admin_update_ayarlar ON public.ayarlar;
CREATE POLICY admin_update_ayarlar ON public.ayarlar
  FOR UPDATE USING (
    auth.role() = 'admin'
  );

-- Fotograflar tablosu için admin policy
DROP POLICY IF EXISTS admin_select_fotograflar ON public.fotograflar;
CREATE POLICY admin_select_fotograflar ON public.fotograflar
  FOR SELECT USING (
    auth.role() = 'admin'
  );

DROP POLICY IF EXISTS admin_insert_fotograflar ON public.fotograflar;
CREATE POLICY admin_insert_fotograflar ON public.fotograflar
  FOR INSERT WITH CHECK (
    auth.role() = 'admin'
  );

-- Reklam kampanyaları tablosu için admin policy
DROP POLICY IF EXISTS admin_crud_reklam ON public.reklam_kampanyalari;
CREATE POLICY admin_crud_reklam ON public.reklam_kampanyalari
  FOR ALL USING (
    auth.role() = 'admin'
  );

-- Policy testleri için örnek sorgu
-- SELECT * FROM public.ayarlar WHERE auth.role() = 'admin';

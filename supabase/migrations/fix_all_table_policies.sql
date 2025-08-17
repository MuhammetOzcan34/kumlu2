-- Tüm tabloların RLS politikalarını döngüsel referans olmayacak şekilde düzelt
-- Profiles tablosu yerine kullanici_rolleri tablosunu kullan

-- 1. Servis bedelleri tablosu politikalarını düzelt
DROP POLICY IF EXISTS "Allow admin manage service fees" ON public.servis_bedelleri;
DROP POLICY IF EXISTS "Allow public read access to service fees" ON public.servis_bedelleri;

CREATE POLICY "servis_bedelleri_public_read" ON public.servis_bedelleri
  FOR SELECT USING (true);

CREATE POLICY "servis_bedelleri_admin_manage" ON public.servis_bedelleri
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.jwt() ->> 'email'
      AND kr.role = 'admin'
    )
  );

-- 2. Hesaplama ürünleri tablosu politikalarını düzelt
DROP POLICY IF EXISTS "Allow admin manage calculation products" ON public.hesaplama_urunleri;
DROP POLICY IF EXISTS "Allow public read access to calculation products" ON public.hesaplama_urunleri;

CREATE POLICY "hesaplama_urunleri_public_read" ON public.hesaplama_urunleri
  FOR SELECT USING (true);

CREATE POLICY "hesaplama_urunleri_admin_manage" ON public.hesaplama_urunleri
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.jwt() ->> 'email'
      AND kr.role = 'admin'
    )
  );

-- 3. Video galeri tablosu politikalarını düzelt
DROP POLICY IF EXISTS "Allow admin manage videos" ON public.video_galeri;
DROP POLICY IF EXISTS "Allow public read access to videos" ON public.video_galeri;

CREATE POLICY "video_galeri_public_read" ON public.video_galeri
  FOR SELECT USING (true);

CREATE POLICY "video_galeri_admin_manage" ON public.video_galeri
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.jwt() ->> 'email'
      AND kr.role = 'admin'
    )
  );

-- 4. Orders tablosu politikalarını düzelt
DROP POLICY IF EXISTS "orders_admin_access" ON public.orders;
DROP POLICY IF EXISTS "orders_user_access" ON public.orders;

CREATE POLICY "orders_user_own" ON public.orders
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "orders_admin_all" ON public.orders
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.jwt() ->> 'email'
      AND kr.role = 'admin'
    )
  );

-- 5. Products tablosu politikalarını düzelt
DROP POLICY IF EXISTS "products_admin_access" ON public.products;
DROP POLICY IF EXISTS "products_public_read" ON public.products;

CREATE POLICY "products_public_read" ON public.products
  FOR SELECT USING (true);

CREATE POLICY "products_admin_manage" ON public.products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.jwt() ->> 'email'
      AND kr.role = 'admin'
    )
  );

-- 6. Logs tablosu politikalarını düzelt
DROP POLICY IF EXISTS "logs_admin_access" ON public.logs;

CREATE POLICY "logs_admin_only" ON public.logs
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.jwt() ->> 'email'
      AND kr.role = 'admin'
    )
  );

-- 7. Settings tablosu politikalarını düzelt
DROP POLICY IF EXISTS "settings_admin_access" ON public.settings;
DROP POLICY IF EXISTS "settings_public_read" ON public.settings;

CREATE POLICY "settings_public_read" ON public.settings
  FOR SELECT USING (true);

CREATE POLICY "settings_admin_manage" ON public.settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.jwt() ->> 'email'
      AND kr.role = 'admin'
    )
  );
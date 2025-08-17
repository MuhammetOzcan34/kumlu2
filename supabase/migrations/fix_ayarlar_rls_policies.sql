-- Ayarlar tablosu RLS politikalarını düzelt
-- Mevcut politikaları kaldır
DROP POLICY IF EXISTS "Allow public read access to settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Allow admin manage settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Ayarlar okuma" ON public.ayarlar;
DROP POLICY IF EXISTS "Ayarlar yazma" ON public.ayarlar;
DROP POLICY IF EXISTS "Admin can manage settings" ON public.ayarlar;

-- Yeni RLS politikaları oluştur
-- Herkes ayarları okuyabilir
CREATE POLICY "ayarlar_select_policy" ON public.ayarlar
  FOR SELECT USING (true);

-- Sadece admin kullanıcılar ayarları güncelleyebilir
CREATE POLICY "ayarlar_insert_policy" ON public.ayarlar
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_app_meta_data->>'role' = 'admin' OR auth.users.email = 'admin@kumlu2.com')
    )
  );

CREATE POLICY "ayarlar_update_policy" ON public.ayarlar
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_app_meta_data->>'role' = 'admin' OR auth.users.email = 'admin@kumlu2.com')
    )
  );

CREATE POLICY "ayarlar_delete_policy" ON public.ayarlar
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND (auth.users.raw_app_meta_data->>'role' = 'admin' OR auth.users.email = 'admin@kumlu2.com')
    )
  );

-- Gerekli izinleri ver
GRANT SELECT ON public.ayarlar TO anon, authenticated;
GRANT INSERT, UPDATE, DELETE ON public.ayarlar TO authenticated;

-- Ayarlar tablosunda RLS'nin etkin olduğundan emin ol
ALTER TABLE public.ayarlar ENABLE ROW LEVEL SECURITY;
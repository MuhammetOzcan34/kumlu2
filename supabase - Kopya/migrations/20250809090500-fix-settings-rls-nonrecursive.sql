-- Ensure settings table has public read and admin write without recursive checks

-- Ayarlar için mevcut çakışabilecek politikaları temizle
DROP POLICY IF EXISTS "Allow public read access to settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Ayarlar herkese görünür" ON public.ayarlar;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Admins can update settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Admins can delete settings" ON public.ayarlar;

-- Herkese okuma izni (site çalışsın)
CREATE POLICY "Allow public read access to settings"
ON public.ayarlar
FOR SELECT
USING (true);

-- Admin yazma izinleri: helper fonksiyonla
CREATE POLICY "Admins can insert settings"
ON public.ayarlar
FOR INSERT
WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can update settings"
ON public.ayarlar
FOR UPDATE
USING (public.get_user_role(auth.uid()) = 'admin');

CREATE POLICY "Admins can delete settings"
ON public.ayarlar
FOR DELETE
USING (public.get_user_role(auth.uid()) = 'admin');



-- Sonsuz döngü problemini çözmek için helper fonksiyon ve politika düzeltmeleri

-- Helper fonksiyon oluştur (sonsuz döngüyü önlemek için)
CREATE OR REPLACE FUNCTION public.get_user_role(user_uuid uuid)
RETURNS text
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT role FROM public.profiles WHERE user_id = user_uuid LIMIT 1;
$$;

-- Profiles tablosu için problematik politikaları sil
DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for users" ON public.profiles;
DROP POLICY IF EXISTS "Enable read access for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users" ON public.profiles;

-- Yeni güvenli politikalar oluştur
CREATE POLICY "Admins can view all profiles"
ON public.profiles
FOR SELECT
USING (
  public.get_user_role(auth.uid()) = 'admin'
);

CREATE POLICY "Admins can update all profiles"
ON public.profiles
FOR UPDATE
USING (
  public.get_user_role(auth.uid()) = 'admin'
);

-- Kullanıcılar kendi profillerini görebilir
CREATE POLICY "Users can view own profile"
ON public.profiles
FOR SELECT
USING (auth.uid() = user_id);

-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "Users can update own profile"
ON public.profiles
FOR UPDATE
USING (auth.uid() = user_id);

-- Kullanıcılar kendi profillerini oluşturabilir
CREATE POLICY "Users can insert own profile"
ON public.profiles
FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Ayarlar tablosu için de aynı düzeltmeyi uygula
DROP POLICY IF EXISTS "Allow public read access to settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Ayarlar herkese görünür" ON public.ayarlar;
DROP POLICY IF EXISTS "Admins can insert settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Admins can update settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Admins can delete settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Allow admin update settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Allow admin insert settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Allow admin delete settings" ON public.ayarlar;

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

-- Diğer tablolar için de aynı yaklaşımı uygula
DROP POLICY IF EXISTS "Allow admin manage photos" ON public.fotograflar;
CREATE POLICY "Allow admin manage photos" ON public.fotograflar
FOR ALL USING (
  public.get_user_role(auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Allow admin manage categories" ON public.kategoriler;
CREATE POLICY "Allow admin manage categories" ON public.kategoriler
FOR ALL USING (
  public.get_user_role(auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Allow admin manage service fees" ON public.servis_bedelleri;
CREATE POLICY "Allow admin manage service fees" ON public.servis_bedelleri
FOR ALL USING (
  public.get_user_role(auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Allow admin manage calculation products" ON public.hesaplama_urunleri;
CREATE POLICY "Allow admin manage calculation products" ON public.hesaplama_urunleri
FOR ALL USING (
  public.get_user_role(auth.uid()) = 'admin'
);

DROP POLICY IF EXISTS "Allow admin manage video gallery" ON public.video_galeri;
CREATE POLICY "Allow admin manage video gallery" ON public.video_galeri
FOR ALL USING (
  public.get_user_role(auth.uid()) = 'admin'
);
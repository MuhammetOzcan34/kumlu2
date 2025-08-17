-- Profiles tablosundaki sonsuz döngü hatasını düzelt
-- Döngüsel referansları kaldır ve kullanici_rolleri tablosunu kullan

-- 1. Mevcut tüm profiles politikalarını sil
DROP POLICY IF EXISTS "Enable read access for users" ON public.profiles;
DROP POLICY IF EXISTS "Enable insert for authenticated users" ON public.profiles;
DROP POLICY IF EXISTS "Enable update for users" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Kullanicilar kendi profillerini gorebilir" ON public.profiles;
DROP POLICY IF EXISTS "Kullanicilar kendi profillerini guncelleyebilir" ON public.profiles;

-- 2. Döngüsel referans olmayan yeni politikalar oluştur
-- Kullanıcılar sadece kendi profillerini görebilir
CREATE POLICY "profiles_select_own" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "profiles_update_own" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Yeni kullanıcı profili oluşturma
CREATE POLICY "profiles_insert_own" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Admin erişimi için kullanici_rolleri tablosunu kullan (döngüsel referans yok)
CREATE POLICY "profiles_admin_access" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.jwt() ->> 'email'
      AND kr.role = 'admin'
    )
  );

-- 3. Profiles tablosuna anon erişimi ver (gerekli tablolar için)
GRANT SELECT ON public.profiles TO anon;
GRANT ALL ON public.profiles TO authenticated;

-- 4. kullanici_rolleri tablosu için basit politikalar
DROP POLICY IF EXISTS "kullanici_rolleri_select" ON public.kullanici_rolleri;
DROP POLICY IF EXISTS "kullanici_rolleri_admin_all" ON public.kullanici_rolleri;

-- Herkes kendi rol bilgisini görebilir
CREATE POLICY "kullanici_rolleri_select_own" ON public.kullanici_rolleri
  FOR SELECT USING (email = auth.jwt() ->> 'email');

-- Admin tüm rolleri yönetebilir
CREATE POLICY "kullanici_rolleri_admin_manage" ON public.kullanici_rolleri
  FOR ALL USING (
    email = auth.jwt() ->> 'email' AND role = 'admin'
  );
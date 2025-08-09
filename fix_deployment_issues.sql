-- ========================================
-- DAĞITIM SORUNLARINI DÜZELTME
-- ========================================

-- 1. Profiles tablosu için RLS politikalarını düzelt
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları sil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

-- Yeni politikalar oluştur
CREATE POLICY "Enable read access for users" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Enable insert for authenticated users" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- 2. Ayarlar tablosu için RLS politikalarını düzelt
ALTER TABLE public.ayarlar ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları sil
DROP POLICY IF EXISTS "Allow public read access to settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Allow admin update settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Allow admin insert settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Allow admin delete settings" ON public.ayarlar;

-- Yeni politikalar oluştur
CREATE POLICY "Enable read access for all" ON public.ayarlar
  FOR SELECT USING (true);

CREATE POLICY "Enable full access for admin" ON public.ayarlar
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 3. Diğer tablolar için basit politikalar
ALTER TABLE public.kategoriler ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.kategoriler;
CREATE POLICY "Enable read access for all" ON public.kategoriler
  FOR SELECT USING (true);

CREATE POLICY "Enable full access for admin" ON public.kategoriler
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

ALTER TABLE public.fotograflar ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to photos" ON public.fotograflar;
CREATE POLICY "Enable read access for all" ON public.fotograflar
  FOR SELECT USING (true);

CREATE POLICY "Enable full access for admin" ON public.fotograflar
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 4. Kullanıcı profili oluşturma trigger'ını kontrol et
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email), 'user');
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Hata durumunda bile trigger başarılı olsun
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı yeniden oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Admin kullanıcısını kontrol et ve oluştur
DO $$
BEGIN
  -- Eğer admin@camkumlama.com kullanıcısı varsa admin yap
  UPDATE public.profiles 
  SET role = 'admin' 
  WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'admin@camkumlama.com'
  );
  
  -- Eğer hiç admin yoksa, ilk kullanıcıyı admin yap
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
    UPDATE public.profiles 
    SET role = 'admin' 
    WHERE user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1);
  END IF;
END $$;

-- 6. Temel ayarları ekle
INSERT INTO public.ayarlar (anahtar, deger, aciklama) VALUES
('firma_adi', 'Kumlu Folyo', 'Firma adı')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO public.ayarlar (anahtar, deger, aciklama) VALUES
('firma_logo_url', '', 'Firma logo URL')
ON CONFLICT (anahtar) DO NOTHING;-- ========================================
-- DAĞITIM SORUNLARINI DÜZELTME
-- ========================================

-- 1. Profiles tablosu için RLS politikalarını düzelt
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları sil
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;

-- Yeni politikalar oluştur
CREATE POLICY "Enable read access for users" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

CREATE POLICY "Enable insert for authenticated users" ON public.profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Enable update for users" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id OR 
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin'));

-- 2. Ayarlar tablosu için RLS politikalarını düzelt
ALTER TABLE public.ayarlar ENABLE ROW LEVEL SECURITY;

-- Mevcut politikaları sil
DROP POLICY IF EXISTS "Allow public read access to settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Allow admin update settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Allow admin insert settings" ON public.ayarlar;
DROP POLICY IF EXISTS "Allow admin delete settings" ON public.ayarlar;

-- Yeni politikalar oluştur
CREATE POLICY "Enable read access for all" ON public.ayarlar
  FOR SELECT USING (true);

CREATE POLICY "Enable full access for admin" ON public.ayarlar
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 3. Diğer tablolar için basit politikalar
ALTER TABLE public.kategoriler ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to categories" ON public.kategoriler;
CREATE POLICY "Enable read access for all" ON public.kategoriler
  FOR SELECT USING (true);

CREATE POLICY "Enable full access for admin" ON public.kategoriler
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

ALTER TABLE public.fotograflar ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Allow public read access to photos" ON public.fotograflar;
CREATE POLICY "Enable read access for all" ON public.fotograflar
  FOR SELECT USING (true);

CREATE POLICY "Enable full access for admin" ON public.fotograflar
  FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE user_id = auth.uid() AND role = 'admin')
  );

-- 4. Kullanıcı profili oluşturma trigger'ını kontrol et
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name, role)
  VALUES (new.id, new.email, COALESCE(new.raw_user_meta_data->>'full_name', new.email), 'user');
  RETURN new;
EXCEPTION
  WHEN others THEN
    -- Hata durumunda bile trigger başarılı olsun
    RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger'ı yeniden oluştur
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 5. Admin kullanıcısını kontrol et ve oluştur
DO $$
BEGIN
  -- Eğer admin@camkumlama.com kullanıcısı varsa admin yap
  UPDATE public.profiles 
  SET role = 'admin' 
  WHERE user_id IN (
    SELECT id FROM auth.users WHERE email = 'admin@camkumlama.com'
  );
  
  -- Eğer hiç admin yoksa, ilk kullanıcıyı admin yap
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
    UPDATE public.profiles 
    SET role = 'admin' 
    WHERE user_id = (SELECT id FROM auth.users ORDER BY created_at LIMIT 1);
  END IF;
END $$;

-- 6. Temel ayarları ekle
INSERT INTO public.ayarlar (anahtar, deger, aciklama) VALUES
('firma_adi', 'Kumlu Folyo', 'Firma adı')
ON CONFLICT (anahtar) DO NOTHING;

INSERT INTO public.ayarlar (anahtar, deger, aciklama) VALUES
('firma_logo_url', '', 'Firma logo URL')
ON CONFLICT (anahtar) DO NOTHING;
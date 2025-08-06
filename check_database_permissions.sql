-- Database tablolarının RLS durumunu kontrol et
-- Bu komutları Supabase SQL Editor'da çalıştırın

-- 1. Tabloların RLS durumunu kontrol et
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('kategoriler', 'fotograflar', 'ayarlar', 'profiles');

-- 2. Mevcut RLS politikalarını listele
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('kategoriler', 'fotograflar', 'ayarlar', 'profiles')
ORDER BY tablename, policyname;

-- 3. Kategoriler tablosundaki verileri test et
SELECT COUNT(*) as kategori_sayisi FROM public.kategoriler;

-- 4. Fotograflar tablosundaki verileri test et
SELECT COUNT(*) as fotograf_sayisi FROM public.fotograflar;

-- 5. Ayarlar tablosundaki verileri test et
SELECT COUNT(*) as ayar_sayisi FROM public.ayarlar;

-- 6. Eğer kategoriler tablosu boşsa, basit bir politika ekle
-- (Sadece gerekirse kullanın)
/*
DROP POLICY IF EXISTS "Enable read access for all users" ON public.kategoriler;
CREATE POLICY "Enable read access for all users" ON public.kategoriler
  FOR SELECT USING (true);

DROP POLICY IF EXISTS "Enable read access for all users" ON public.fotograflar;
CREATE POLICY "Enable read access for all users" ON public.fotograflar
  FOR SELECT USING (true);
*/ 
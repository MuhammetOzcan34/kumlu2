-- Bu betik, 'hesaplama_urunleri_backup' tablosu için RLS politikalarını ayarlar.
-- Genel kullanıcılar için okuma erişimi sağlar ve yalnızca yöneticilere tam erişim (INSERT, UPDATE, DELETE) verir.

-- 1. Tabloda RLS'yi etkinleştir (zaten yapıldıysa bu adımı atlayabilirsiniz)
ALTER TABLE public.hesaplama_urunleri_backup ENABLE ROW LEVEL SECURITY;

-- 2. Herkes için okuma (SELECT) politikası
DROP POLICY IF EXISTS "Enable read access for all users" ON public.hesaplama_urunleri_backup;
CREATE POLICY "Enable read access for all users" 
ON public.hesaplama_urunleri_backup
FOR SELECT
USING (true);

-- 3. Yöneticiler için ekleme (INSERT) politikası
-- Not: Bu politika, 'profiles' tablosunda 'role' sütunu olan ve 'admin' değerine sahip kullanıcıların yönetici olduğunu varsayar.
-- Eğer yönetici rolünüz farklı bir şekilde tanımlanmışsa, 'qual' kısmını güncellemeniz gerekir.
DROP POLICY IF EXISTS "Allow admins to insert" ON public.hesaplama_urunleri_backup;
CREATE POLICY "Allow admins to insert"
ON public.hesaplama_urunleri_backup
FOR INSERT
WITH CHECK ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- 4. Yöneticiler için güncelleme (UPDATE) politikası
DROP POLICY IF EXISTS "Allow admins to update" ON public.hesaplama_urunleri_backup;
CREATE POLICY "Allow admins to update"
ON public.hesaplama_urunleri_backup
FOR UPDATE
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );

-- 5. Yöneticiler için silme (DELETE) politikası
DROP POLICY IF EXISTS "Allow admins to delete" ON public.hesaplama_urunleri_backup;
CREATE POLICY "Allow admins to delete"
ON public.hesaplama_urunleri_backup
FOR DELETE
USING ( (SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin' );
-- Bu betik, 'fotograflar' bucket'ının RLS politikalarını filigran ekleme için optimize eder.
-- Herkese açık okuma izni vererek tarayıcının logo dosyasını sorunsuzca çekmesini sağlar.

-- Önce mevcut olabilecek çakışan politikaları temizleyelim
DROP POLICY IF EXISTS "Public Read Access for Photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Upload for Photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Update for Photos" ON storage.objects;
DROP POLICY IF EXISTS "Authenticated Delete for Photos" ON storage.objects;

-- 1. Politika: Herkes için Genel Okuma Erişimi
-- Bu politika, 'fotograflar' bucket'ındaki tüm nesnelerin (dosyaların)
-- URL'si bilindiğinde herkes tarafından okunabilmesini (görüntülenebilmesini) sağlar.
-- Bu, `loadLogo` fonksiyonunun logoyu çekmesi için kritiktir.
CREATE POLICY "Public Read Access for Photos"
ON storage.objects FOR SELECT
USING ( bucket_id = 'fotograflar' );

-- 2. Politika: Yetkili Kullanıcılar için Yükleme (INSERT)
-- Sadece giriş yapmış (authenticated) kullanıcıların 'fotograflar' bucket'ına
-- yeni dosyalar yüklemesine izin verir.
CREATE POLICY "Authenticated Upload for Photos"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'fotograflar' AND auth.role() = 'authenticated' );

-- 3. Politika: Yetkili Kullanıcılar için Güncelleme (UPDATE)
-- Sadece giriş yapmış kullanıcıların 'fotograflar' bucket'ındaki dosyaları
-- güncellemesine izin verir.
CREATE POLICY "Authenticated Update for Photos"
ON storage.objects FOR UPDATE
USING ( bucket_id = 'fotograflar' AND auth.role() = 'authenticated' );

-- 4. Politika: Yetkili Kullanıcılar için Silme (DELETE)
-- Sadece giriş yapmış kullanıcıların 'fotograflar' bucket'ından dosya
-- silmesine izin verir.
CREATE POLICY "Authenticated Delete for Photos"
ON storage.objects FOR DELETE
USING ( bucket_id = 'fotograflar' AND auth.role() = 'authenticated' );

-- Bilgilendirme: Bu politikaları çalıştırdıktan sonra Supabase Dashboard -> Storage -> Policies
-- bölümünden 'fotograflar' bucket'ı için 4 yeni politikanın eklendiğini doğrulayabilirsiniz.
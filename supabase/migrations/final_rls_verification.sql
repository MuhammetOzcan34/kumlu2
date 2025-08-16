-- Son RLS politika doğrulaması

-- 1. Ayarlar tablosu politikalarını kontrol et
SELECT 
    'ayarlar' as tablo,
    policyname,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'ayarlar';

-- 2. Fotograflar tablosu politikalarını kontrol et
SELECT 
    'fotograflar' as tablo,
    policyname,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE tablename = 'fotograflar';

-- 3. RLS durumunu kontrol et
SELECT 
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE tablename IN ('ayarlar', 'fotograflar')
    AND schemaname = 'public';

-- 4. Tablo izinlerini son kez kontrol et
SELECT 
    table_name,
    grantee,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name IN ('ayarlar', 'fotograflar')
    AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;

-- 5. Test sorguları (anonim kullanıcı perspektifinden)
-- Bu sorgular başarılı olmalı
SELECT 'Test: ayarlar tablosu' as test_name, COUNT(*) as kayit_sayisi FROM ayarlar;
SELECT 'Test: fotograflar tablosu' as test_name, COUNT(*) as kayit_sayisi FROM fotograflar WHERE aktif = true;
-- Mevcut RLS politikalarını ve tablo izinlerini kontrol et

-- 1. Ayarlar tablosu RLS politikalarını kontrol et
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'ayarlar';

-- 2. Fotograflar tablosu RLS politikalarını kontrol et
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM pg_policies 
WHERE tablename = 'fotograflar';

-- 3. Tablo izinlerini kontrol et
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name IN ('ayarlar', 'fotograflar')
    AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;

-- 4. RLS durumunu kontrol et
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE tablename IN ('ayarlar', 'fotograflar')
    AND schemaname = 'public';

-- 5. Anonim kullanıcı test sorguları
-- Bu sorgular anonim kullanıcı perspektifinden test edilebilir
-- SELECT * FROM ayarlar LIMIT 1;
-- SELECT * FROM fotograflar WHERE aktif = true LIMIT 1;
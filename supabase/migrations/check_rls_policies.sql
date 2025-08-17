-- RLS politikalarını kontrol et
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
WHERE schemaname = 'public' 
AND tablename IN ('ayarlar', 'fotograflar')
ORDER BY tablename, policyname;

-- Tablo izinlerini kontrol et
SELECT 
    grantee, 
    table_name, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND grantee IN ('anon', 'authenticated') 
AND table_name IN ('ayarlar', 'fotograflar')
ORDER BY table_name, grantee;

-- RLS durumunu kontrol et
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('ayarlar', 'fotograflar');
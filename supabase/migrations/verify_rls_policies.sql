-- RLS politikalarının doğru uygulandığını doğrula

-- Ayarlar tablosu politikalarını kontrol et
SELECT 
    'ayarlar' as tablo,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'ayarlar';

-- Fotograflar tablosu politikalarını kontrol et
SELECT 
    'fotograflar' as tablo,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename = 'fotograflar';

-- Tablo izinlerini kontrol et
SELECT 
    table_name,
    grantee, 
    privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name IN ('ayarlar', 'fotograflar')
AND grantee IN ('anon', 'authenticated') 
ORDER BY table_name, grantee;

-- Test sorguları (anonim erişim simülasyonu)
SELECT 'Ayarlar test' as test, COUNT(*) as kayit_sayisi FROM ayarlar;
SELECT 'Fotograflar test' as test, COUNT(*) as kayit_sayisi FROM fotograflar;
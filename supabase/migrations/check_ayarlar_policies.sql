-- Ayarlar tablosunun mevcut RLS politikalarını kontrol et
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

-- Ayarlar tablosuna admin kullanıcısı için tam yetki ver
DROP POLICY IF EXISTS "Admin ayarlar tam yetki" ON ayarlar;
CREATE POLICY "Admin ayarlar tam yetki" ON ayarlar
    FOR ALL
    TO authenticated
    USING (auth.jwt() ->> 'role' = 'admin')
    WITH CHECK (auth.jwt() ->> 'role' = 'admin');

-- Ayarlar tablosuna genel okuma yetkisi ver
DROP POLICY IF EXISTS "Ayarlar genel okuma" ON ayarlar;
CREATE POLICY "Ayarlar genel okuma" ON ayarlar
    FOR SELECT
    TO anon, authenticated
    USING (true);

-- Tabloya izinleri kontrol et
SELECT grantee, table_name, privilege_type 
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
AND table_name = 'ayarlar' 
AND grantee IN ('anon', 'authenticated') 
ORDER BY grantee, privilege_type;
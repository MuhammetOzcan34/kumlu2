-- Profiles tablosundaki RLS politikalarını kontrol et
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
WHERE tablename = 'profiles';

-- Profiles tablosundaki mevcut verileri kontrol et
SELECT id, user_id, email, role, created_at FROM profiles LIMIT 5;

-- kullanici_rolleri tablosundaki verileri kontrol et
SELECT * FROM kullanici_rolleri LIMIT 5;
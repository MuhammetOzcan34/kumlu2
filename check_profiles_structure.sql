-- Profiles tablosunun yapısını kontrol et
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public' 
AND table_name = 'profiles'
ORDER BY ordinal_position;

-- Profiles tablosundaki verileri kontrol et
SELECT * FROM public.profiles;

-- Kullanıcıyı admin yap
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = '9c2af30e-10f7-4620-85d5-5cbb12da1b41';

-- Storage bucket'ları kontrol et
SELECT 
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- Storage politikalarını kontrol et
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE schemaname = 'storage'
ORDER BY tablename, policyname; 
-- ========================================
-- SUPABASE DURUM KONTROL SORGULARI
-- ========================================

-- 1. Tüm tabloları listele
SELECT 
    schemaname,
    tablename,
    tableowner
FROM pg_tables 
WHERE schemaname IN ('public', 'auth')
ORDER BY schemaname, tablename;

-- 2. RLS durumunu kontrol et
SELECT 
    schemaname,
    tablename,
    rowsecurity as rls_enabled
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Tüm politikaları listele
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
ORDER BY tablename, policyname;

-- 4. Storage bucket'ları kontrol et
SELECT 
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- 5. Storage politikalarını kontrol et
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
WHERE schemaname = 'storage'
ORDER BY tablename, policyname;

-- 6. Kullanıcıları kontrol et
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at
FROM auth.users
ORDER BY created_at DESC;

-- 7. Profiles tablosunu kontrol et
SELECT 
    id,
    email,
    full_name,
    role,
    created_at,
    updated_at
FROM public.profiles
ORDER BY created_at DESC;

-- 8. Ayarlar tablosunu kontrol et
SELECT 
    anahtar,
    deger,
    aciklama,
    guncelleme_tarihi
FROM public.ayarlar
ORDER BY anahtar;

-- 9. Diğer tabloların kayıt sayılarını kontrol et
SELECT 'kategoriler' as tablo, COUNT(*) as kayit_sayisi FROM public.kategoriler
UNION ALL
SELECT 'fotograflar' as tablo, COUNT(*) as kayit_sayisi FROM public.fotograflar
UNION ALL
SELECT 'kampanyalar' as tablo, COUNT(*) as kayit_sayisi FROM public.kampanyalar
UNION ALL
SELECT 'servis_bedelleri' as tablo, COUNT(*) as kayit_sayisi FROM public.servis_bedelleri
UNION ALL
SELECT 'hesaplama_urunleri' as tablo, COUNT(*) as kayit_sayisi FROM public.hesaplama_urunleri
UNION ALL
SELECT 'video_galeri' as tablo, COUNT(*) as kayit_sayisi FROM public.video_galeri;

-- 10. Trigger'ları kontrol et
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name; 
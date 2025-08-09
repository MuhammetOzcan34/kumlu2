-- ========================================
-- SUPABASE DURUM KONTROL SORGULARI - DÜZELTİLMİŞ
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

-- 3. Profiles tablosunu kontrol et
SELECT COUNT(*) as profile_sayisi FROM public.profiles;

-- 4. Ayarlar tablosunu kontrol et
SELECT COUNT(*) as ayar_sayisi FROM public.ayarlar;

-- 5. Admin kullanıcısını kontrol et
SELECT 
    user_id,
    email,
    full_name,
    role,
    created_at
FROM public.profiles
WHERE role = 'admin';

-- 6. Tüm politikaları listele
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

-- 7. Storage bucket'ları kontrol et
SELECT 
    name,
    public,
    file_size_limit,
    allowed_mime_types
FROM storage.buckets
ORDER BY name;

-- 8. Storage politikalarını kontrol et
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

-- 9. Kullanıcıları kontrol et
SELECT 
    id,
    email,
    email_confirmed_at,
    created_at,
    updated_at
FROM auth.users
ORDER BY created_at DESC;

-- 10. Profiles tablosunu detaylı kontrol et
SELECT 
    id,
    user_id,
    email,
    full_name,
    display_name,
    role,
    created_at,
    updated_at
FROM public.profiles
ORDER BY created_at DESC;

-- 11. Ayarlar tablosunu kontrol et
SELECT 
    anahtar,
    deger,
    aciklama,
    created_at,
    updated_at
FROM public.ayarlar
ORDER BY anahtar;

-- 12. Diğer tabloların kayıt sayılarını kontrol et
SELECT 'kategoriler' as tablo, COUNT(*) as kayit_sayisi FROM public.kategoriler
UNION ALL
SELECT 'fotograflar' as tablo, COUNT(*) as kayit_sayisi FROM public.fotograflar
UNION ALL
SELECT 'servis_bedelleri' as tablo, COUNT(*) as kayit_sayisi FROM public.servis_bedelleri
UNION ALL
SELECT 'hesaplama_urunleri' as tablo, COUNT(*) as kayit_sayisi FROM public.hesaplama_urunleri
UNION ALL
SELECT 'video_galeri' as tablo, COUNT(*) as kayit_sayisi FROM public.video_galeri;

-- 13. Trigger'ları kontrol et
SELECT 
    trigger_name,
    event_manipulation,
    event_object_table,
    action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
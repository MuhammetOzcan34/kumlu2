-- Kullanıcının oturumunu yenilemesi için gerekli işlemler
-- Bu migration kullanıcının admin rolünü kontrol eder ve oturum yenilenmesini sağlar

-- 1. Mevcut kullanıcının admin durumunu kontrol et
SELECT 
    'Kullanıcı Durumu Kontrolü' as islem,
    au.id,
    au.email,
    au.raw_app_meta_data->>'role' as app_metadata_role,
    p.role as profile_role,
    kr.role as kullanici_rolleri_role,
    kr.is_super_admin
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
LEFT JOIN kullanici_rolleri kr ON au.email = kr.email
WHERE au.last_sign_in_at IS NOT NULL
ORDER BY au.last_sign_in_at DESC
LIMIT 5;

-- 2. Admin kullanıcısının JWT token'ını yenilemesi için session'ları temizle
-- NOT: Bu işlem kullanıcının tekrar giriş yapmasını gerektirir
UPDATE auth.refresh_tokens 
SET revoked = true, updated_at = NOW()
WHERE user_id::uuid IN (
    SELECT id FROM auth.users 
    WHERE raw_app_meta_data->>'role' = 'admin'
    OR id IN (
        SELECT user_id FROM profiles WHERE role = 'admin'
    )
);

-- 3. Kategoriler tablosundaki mevcut politikaları kontrol et
SELECT 
    'RLS Politika Kontrolü' as islem,
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd
FROM pg_policies 
WHERE tablename = 'kategoriler'
ORDER BY policyname;

-- 4. Kategoriler tablosuna erişim izinlerini kontrol et
SELECT 
    'Tablo İzinleri Kontrolü' as islem,
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name = 'kategoriler'
    AND grantee IN ('anon', 'authenticated', 'service_role')
ORDER BY grantee, privilege_type;

-- 5. Test için basit bir kategori ekleme denemesi (admin kontrolü)
-- Bu sadece test amaçlıdır, gerçek veri eklemez
SELECT 
    'Test Kategori Ekleme Yetkisi' as islem,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM information_schema.role_table_grants 
            WHERE table_schema = 'public' 
            AND table_name = 'kategoriler'
            AND grantee = 'authenticated'
            AND privilege_type = 'INSERT'
        ) THEN 'INSERT yetkisi var'
        ELSE 'INSERT yetkisi yok'
    END as insert_yetkisi,
    CASE 
        WHEN EXISTS (
            SELECT 1 FROM pg_policies 
            WHERE tablename = 'kategoriler'
            AND policyname LIKE '%admin%'
        ) THEN 'Admin politikası var'
        ELSE 'Admin politikası yok'
    END as admin_politikasi;

-- Kullanıcıya mesaj
SELECT 
    'UYARI: Oturum token''ları yenilendi. Lütfen çıkış yapıp tekrar giriş yapın.' as mesaj,
    'Admin yetkilerinizin aktif olması için oturum yenilenmesi gerekiyor.' as aciklama;
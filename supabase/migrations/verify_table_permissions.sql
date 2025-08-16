-- Tablo izinlerini kontrol et ve anon rolüne gerekli izinleri ver

-- 1. Mevcut izinleri kontrol et
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND table_name IN ('ayarlar', 'fotograflar')
    AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;

-- 2. Anon rolüne eksik izinleri ver
GRANT SELECT ON ayarlar TO anon;
GRANT SELECT ON fotograflar TO anon;
GRANT SELECT ON ayarlar TO authenticated;
GRANT SELECT ON fotograflar TO authenticated;

-- 3. Diğer önemli tablolar için de izin ver (eğer varsa)
GRANT SELECT ON kategoriler TO anon;
GRANT SELECT ON kampanyalar TO anon;
GRANT SELECT ON servis_bedelleri TO anon;
GRANT SELECT ON video_galeri TO anon;
GRANT SELECT ON hesaplama_urunleri TO anon;
GRANT SELECT ON hesaplama_fiyatlar TO anon;
GRANT SELECT ON ek_ozellikler TO anon;
GRANT SELECT ON marka_logolari TO anon;
GRANT SELECT ON reklam_kampanyalari TO anon;

-- Authenticated kullanıcılar için de aynı izinler
GRANT SELECT ON kategoriler TO authenticated;
GRANT SELECT ON kampanyalar TO authenticated;
GRANT SELECT ON servis_bedelleri TO authenticated;
GRANT SELECT ON video_galeri TO authenticated;
GRANT SELECT ON hesaplama_urunleri TO authenticated;
GRANT SELECT ON hesaplama_fiyatlar TO authenticated;
GRANT SELECT ON ek_ozellikler TO authenticated;
GRANT SELECT ON marka_logolari TO authenticated;
GRANT SELECT ON reklam_kampanyalari TO authenticated;

-- 4. İzinleri tekrar kontrol et
SELECT 
    grantee,
    table_name,
    privilege_type
FROM information_schema.role_table_grants 
WHERE table_schema = 'public' 
    AND grantee IN ('anon', 'authenticated')
ORDER BY table_name, grantee;
-- Slider görsellerini kontrol et ve sil
-- CORB hatası veren slider1.jpg, slider2.jpg, slider3.jpg dosyalarını temizle

-- Önce mevcut storage dosyalarını kontrol et
SELECT 
    name,
    bucket_id,
    created_at,
    updated_at,
    metadata
FROM storage.objects 
WHERE bucket_id = 'photos' 
    AND (name LIKE '%slider1%' OR name LIKE '%slider2%' OR name LIKE '%slider3%');

-- Slider görsellerini sil
DELETE FROM storage.objects 
WHERE bucket_id = 'photos' 
    AND (name LIKE '%slider1%' OR name LIKE '%slider2%' OR name LIKE '%slider3%');

-- Silme işleminin sonucunu kontrol et
SELECT 
    'Slider görselleri silindi' as message,
    COUNT(*) as remaining_slider_files
FROM storage.objects 
WHERE bucket_id = 'photos' 
    AND (name LIKE '%slider1%' OR name LIKE '%slider2%' OR name LIKE '%slider3%');
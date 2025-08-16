-- RLS'yi geçici olarak devre dışı bırak - Test amaçlı
-- Bu işlem 401 hatalarının kaynağını test etmek için yapılıyor

-- Ayarlar tablosunda RLS'yi devre dışı bırak
ALTER TABLE ayarlar DISABLE ROW LEVEL SECURITY;

-- Fotograflar tablosunda RLS'yi devre dışı bırak
ALTER TABLE fotograflar DISABLE ROW LEVEL SECURITY;

-- Test sonrası durumu kontrol et
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM pg_tables 
WHERE schemaname = 'public'
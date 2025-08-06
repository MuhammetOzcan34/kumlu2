-- Ayarlar tablosunu kontrol et
SELECT 
  table_name,
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns 
WHERE table_name = 'ayarlar'
ORDER BY ordinal_position;

-- Ayarlar tablosundaki mevcut verileri kontrol et
SELECT * FROM ayarlar WHERE anahtar LIKE '%logo%';

-- Tüm ayarları listele
SELECT * FROM ayarlar ORDER BY anahtar;

-- Ayarlar tablosunun RLS politikalarını kontrol et
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
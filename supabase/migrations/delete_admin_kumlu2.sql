-- admin@kumlu2.com hesabını profiles tablosundan sil
DELETE FROM profiles 
WHERE email = 'admin@kumlu2.com';

-- Silme işleminin sonucunu kontrol et
SELECT 
    COUNT(*) as deleted_count
FROM profiles 
WHERE email = 'admin@kumlu2.com';
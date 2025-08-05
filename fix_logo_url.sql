-- Mevcut firma_logo_url değerini sadece dosya adı olacak şekilde güncelle
UPDATE ayarlar 
SET deger = 'company-logo-1754373890845.jpeg'
WHERE anahtar = 'firma_logo_url';
 
-- Güncellenmiş değeri kontrol et
SELECT anahtar, deger FROM ayarlar WHERE anahtar = 'firma_logo_url'; 
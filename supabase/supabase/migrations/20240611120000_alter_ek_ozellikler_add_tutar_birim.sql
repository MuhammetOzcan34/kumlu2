-- Ek Özellikler tablosuna sabit tutar ve birim alanı ekle
ALTER TABLE ek_ozellikler ADD COLUMN tutar NUMERIC;
ALTER TABLE ek_ozellikler ADD COLUMN birim VARCHAR(16); -- 'adet' veya 'metre' gibi
-- Eski carpani alanı opsiyonel olarak kaldırılabilir veya tutulabilir
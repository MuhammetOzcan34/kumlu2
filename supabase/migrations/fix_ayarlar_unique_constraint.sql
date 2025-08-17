-- Ayarlar tablosuna anahtar kolonu için UNIQUE constraint ekleme
-- Bu, upsert işlemlerini mümkün kılar

-- Önce mevcut constraint'i kaldır (varsa)
ALTER TABLE ayarlar DROP CONSTRAINT IF EXISTS ayarlar_anahtar_unique;

-- Duplicate kayıtları temizle
DELETE FROM ayarlar a1 
USING ayarlar a2 
WHERE a1.id > a2.id 
  AND a1.anahtar = a2.anahtar;

-- Anahtar kolonu için UNIQUE constraint ekle
ALTER TABLE ayarlar 
ADD CONSTRAINT ayarlar_anahtar_unique UNIQUE (anahtar);
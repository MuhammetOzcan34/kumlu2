-- Marka logolarını kontrol et
SELECT 
  id,
  ad,
  resim,
  aciklama,
  aktif
FROM marka_logolari 
ORDER BY id;

-- Toplam logo sayısını kontrol et
SELECT COUNT(*) as toplam_logo_sayisi FROM marka_logolari WHERE aktif = true;

-- Ayarları da kontrol et
SELECT * FROM ayarlar WHERE anahtar LIKE '%brand%';
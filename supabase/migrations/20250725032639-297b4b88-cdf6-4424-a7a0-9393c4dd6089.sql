-- Tüm test/mockup verilerini temizle
DELETE FROM reklam_kampanyalari;
DELETE FROM fotograflar;  
DELETE FROM kategoriler;
DELETE FROM hesaplama_urunleri;
DELETE FROM ayarlar WHERE anahtar NOT IN ('company_name', 'company_logo', 'company_description', 'phone_number', 'address', 'email');

-- Temel ayarları yeniden ekle (eğer yoksa)
INSERT INTO ayarlar (anahtar, deger, aciklama) 
VALUES 
  ('company_name', 'Şirket Adı', 'Şirket adı ayarı'),
  ('company_logo', '', 'Şirket logosu ayarı'),
  ('company_description', 'Şirket açıklaması', 'Şirket açıklama metni'),
  ('phone_number', '+90 555 000 00 00', 'Şirket telefon numarası'),
  ('address', 'Şirket Adresi', 'Şirket adresi'),
  ('email', 'info@sirket.com', 'Şirket e-posta adresi')
ON CONFLICT (anahtar) DO NOTHING;
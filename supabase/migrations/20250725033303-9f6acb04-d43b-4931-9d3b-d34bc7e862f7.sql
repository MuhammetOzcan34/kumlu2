-- Instagram kullanıcı adı ayarını ekle
INSERT INTO ayarlar (anahtar, deger, aciklama) 
VALUES ('instagram_username', 'sirket_hesabi', 'Instagram kullanıcı adı')
ON CONFLICT (anahtar) DO UPDATE SET deger = EXCLUDED.deger;
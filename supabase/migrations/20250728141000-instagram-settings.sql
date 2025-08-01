-- Instagram ayarları için migration
-- Instagram entegrasyonu için gerekli ayarları ekle

-- Instagram access token ayarı
INSERT INTO ayarlar (anahtar, deger, aciklama) 
VALUES ('instagram_access_token', '', 'Instagram Basic Display API access token')
ON CONFLICT (anahtar) DO NOTHING;

-- Instagram aktif/pasif ayarı
INSERT INTO ayarlar (anahtar, deger, aciklama) 
VALUES ('instagram_enabled', 'false', 'Instagram akışını göster/gizle')
ON CONFLICT (anahtar) DO NOTHING;

-- Instagram post sayısı ayarı
INSERT INTO ayarlar (anahtar, deger, aciklama) 
VALUES ('instagram_post_count', '6', 'Gösterilecek Instagram post sayısı')
ON CONFLICT (anahtar) DO NOTHING;

-- Instagram cache süresi ayarı
INSERT INTO ayarlar (anahtar, deger, aciklama) 
VALUES ('instagram_cache_duration', '3600', 'Instagram verilerinin cache süresi (saniye)')
ON CONFLICT (anahtar) DO NOTHING; 
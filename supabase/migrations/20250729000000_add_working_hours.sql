-- Çalışma saatleri ayarı ekle
INSERT INTO public.ayarlar (anahtar, deger, aciklama) VALUES
('firma_calisma_saatleri', 'Pazartesi - Cuma: 08:00 - 18:00\nCumartesi: 09:00 - 17:00\nPazar: Kapalı', 'Firma çalışma saatleri')
ON CONFLICT (anahtar) DO NOTHING; 
-- Firma logo URL ayarını ekle
INSERT INTO public.ayarlar (anahtar, deger, aciklama) VALUES 
('firma_logo_url', '', 'Firma logo dosya yolu/URL')
ON CONFLICT (anahtar) DO UPDATE SET 
  aciklama = EXCLUDED.aciklama,
  updated_at = now();
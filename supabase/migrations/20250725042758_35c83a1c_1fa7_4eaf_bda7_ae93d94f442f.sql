-- Firma koordinat bilgilerini ekle
INSERT INTO public.ayarlar (anahtar, deger, aciklama) VALUES 
('firma_enlem', '41.01050140944172', 'Firma adresinin enlem koordinatı'),
('firma_boylam', '29.168758810096335', 'Firma adresinin boylam koordinatı')
ON CONFLICT (anahtar) DO UPDATE SET 
  deger = EXCLUDED.deger,
  updated_at = now();
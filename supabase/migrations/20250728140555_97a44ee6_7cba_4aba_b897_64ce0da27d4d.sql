-- Insert sample categories for arac-giydirme
INSERT INTO kategoriler (ad, slug, aciklama, tip, sira_no, aktif) VALUES
('Araç Kaportası', 'arac-kaportasi', 'Araç kaportası giydirme çalışmaları', 'arac-giydirme', 1, true),
('Araç Camları', 'arac-camlari', 'Araç cam giydirme ve folyo uygulamaları', 'arac-giydirme', 2, true),
('Reklam Folyoları', 'reklam-folyolari', 'Araç reklam folyo uygulamaları', 'arac-giydirme', 3, true)
ON CONFLICT (slug) DO NOTHING;

-- Brand logos popup ayarları için gerekli ayarları ekle
INSERT INTO public.ayarlar (anahtar, deger, aciklama) VALUES
('brand_popup_enabled', 'true', 'Marka logoları popup aktif/pasif'),
('brand_popup_title', 'Kullandığımız Markalar', 'Marka logoları popup başlığı'),
('brand_popup_description', 'Kaliteli hizmet için tercih ettiğimiz markalar', 'Marka logoları popup açıklaması'),
('brand_popup_duration', '3000', 'Marka logoları popup süresi (milisaniye)'),
('brand_logo_1_name', '', 'Marka 1 adı'),
('brand_logo_1_image', '', 'Marka 1 logo URL'),
('brand_logo_1_description', '', 'Marka 1 açıklaması'),
('brand_logo_2_name', '', 'Marka 2 adı'),
('brand_logo_2_image', '', 'Marka 2 logo URL'),
('brand_logo_2_description', '', 'Marka 2 açıklaması'),
('brand_logo_3_name', '', 'Marka 3 adı'),
('brand_logo_3_image', '', 'Marka 3 logo URL'),
('brand_logo_3_description', '', 'Marka 3 açıklaması'),
('brand_logo_4_name', '', 'Marka 4 adı'),
('brand_logo_4_image', '', 'Marka 4 logo URL'),
('brand_logo_4_description', '', 'Marka 4 açıklaması'),
('brand_logo_5_name', '', 'Marka 5 adı'),
('brand_logo_5_image', '', 'Marka 5 logo URL'),
('brand_logo_5_description', '', 'Marka 5 açıklaması'),
('brand_logo_6_name', '', 'Marka 6 adı'),
('brand_logo_6_image', '', 'Marka 6 logo URL'),
('brand_logo_6_description', '', 'Marka 6 açıklaması'),
('whatsapp_enabled', 'true', 'WhatsApp widget aktif/pasif'),
('whatsapp_number', '+905551234567', 'WhatsApp telefon numarası'),
('whatsapp_message', 'Merhaba, bilgi almak istiyorum.', 'Varsayılan WhatsApp mesajı'),
('whatsapp_position', 'bottom-right', 'WhatsApp widget pozisyonu'),
('whatsapp_color', '#25D366', 'WhatsApp widget rengi')
ON CONFLICT (anahtar) DO NOTHING;
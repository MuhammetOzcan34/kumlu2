-- Fotograflar tablosuna test verileri ekle
INSERT INTO fotograflar (
    baslik, 
    aciklama, 
    dosya_yolu, 
    aktif, 
    sira_no, 
    kullanim_alani, 
    gorsel_tipi
) VALUES 
    ('Ana Sayfa Slider 1', 'İlk slider görseli', '/images/slider1.jpg', true, 1, ARRAY['ana-sayfa-slider'], 'slider'),
    ('Ana Sayfa Slider 2', 'İkinci slider görseli', '/images/slider2.jpg', true, 2, ARRAY['ana-sayfa-slider'], 'slider'),
    ('Ana Sayfa Slider 3', 'Üçüncü slider görseli', '/images/slider3.jpg', true, 3, ARRAY['ana-sayfa-slider'], 'slider'),
    ('Galeri Fotoğraf 1', 'Galeri için örnek fotoğraf', '/images/galeri1.jpg', true, 1, ARRAY['galeri'], 'galeri'),
    ('Galeri Fotoğraf 2', 'Galeri için örnek fotoğraf', '/images/galeri2.jpg', true, 2, ARRAY['galeri'], 'galeri')
ON CONFLICT (id) DO NOTHING;

-- Ayarlar tablosuna eksik verileri ekle
INSERT INTO ayarlar (anahtar, deger, aciklama) 
VALUES 
    ('telefon', '+90 555 123 45 67', 'İletişim telefonu'),
    ('email', 'info@kumlufolyo.com', 'İletişim e-postası'),
    ('adres', 'İstanbul, Türkiye', 'Şirket adresi'),
    ('facebook', 'https://facebook.com/kumlufolyo', 'Facebook sayfası'),
    ('instagram', 'https://instagram.com/kumlufolyo', 'Instagram sayfası'),
    ('whatsapp', '+90 555 123 45 67', 'WhatsApp numarası')
ON CONFLICT (anahtar) DO NOTHING;
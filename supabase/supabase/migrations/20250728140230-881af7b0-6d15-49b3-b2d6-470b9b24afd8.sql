-- Insert some sample categories for arac-giydirme
INSERT INTO kategoriler (ad, slug, aciklama, tip, sira_no, aktif) VALUES
('Araç Kaportası', 'arac-kaportasi', 'Araç kaportası giydirme çalışmaları', 'arac-giydirme', 1, true),
('Araç Camları', 'arac-camlari', 'Araç cam giydirme ve folyo uygulamaları', 'arac-giydirme', 2, true),
('Reklam Folyoları', 'reklam-folyolari', 'Araç reklam folyo uygulamaları', 'arac-giydirme', 3, true)
ON CONFLICT (slug) DO NOTHING;
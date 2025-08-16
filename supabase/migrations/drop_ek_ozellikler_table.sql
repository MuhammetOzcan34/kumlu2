-- Ek özellikler tablosunu ve ilgili politikaları kaldır
-- Bu migration ek özellikler sistemini tamamen kaldırır

-- Önce RLS politikalarını kaldır
DROP POLICY IF EXISTS "Allow public read access to ek_ozellikler" ON public.ek_ozellikler;
DROP POLICY IF EXISTS "Allow admin manage ek_ozellikler" ON public.ek_ozellikler;

-- Tabloyu kaldır
DROP TABLE IF EXISTS public.ek_ozellikler;

-- Eğer varsa sequence'ı da kaldır
DROP SEQUENCE IF EXISTS public.ek_ozellikler_id_seq;

-- İlgili izinleri temizle
REVOKE ALL ON public.ek_ozellikler FROM anon;
REVOKE ALL ON public.ek_ozellikler FROM authenticated;
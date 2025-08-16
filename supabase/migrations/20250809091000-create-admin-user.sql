-- Admin kullanıcısı oluşturma ve profil ayarlama
-- Bu dosya admin kullanıcısı oluşturur ve gerekli profil bilgilerini ayarlar

-- Önce admin kullanıcısının zaten var olup olmadığını kontrol et
DO $$
BEGIN
  -- Eğer admin rolüne sahip kullanıcı yoksa, bir tane oluştur
  IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE role = 'admin') THEN
    -- Admin kullanıcısı için profil oluştur
    -- Not: Bu sadece profil tablosuna kayıt ekler, gerçek auth kullanıcısı manuel olarak oluşturulmalı
    INSERT INTO public.profiles (id, display_name, role, email, full_name, created_at, updated_at)
    VALUES (
      gen_random_uuid(),
      'Admin Kullanıcı',
      'admin',
      'admin@kumlu.com',
      'Sistem Yöneticisi',
      now(),
      now()
    );
    
    RAISE NOTICE 'Admin profili oluşturuldu. Lütfen Supabase Auth panelinden admin@kumlu.com için bir kullanıcı oluşturun.';
  ELSE
    RAISE NOTICE 'Admin kullanıcısı zaten mevcut.';
  END IF;
END
$$;
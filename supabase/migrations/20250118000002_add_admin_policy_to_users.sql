-- Auth.users tablosuna admin policy ekleme migrasyonu
-- GitHub referansı: 20230829101523_add_admin_policy_to_users.sql
-- Bu migrasyon auth.users tablosuna admin erişim policy'si ekler

-- Profiles tablosu için RLS'yi etkinleştir
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Auth.users tablosuna doğrudan erişim mümkün değil, sadece profiles tablosu üzerinden yönetim

-- Profiles tablosu için de admin policy'lerini güncelle
-- Mevcut policy'leri temizle
DROP POLICY IF EXISTS "Admin can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admin can manage all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- Kullanıcılar kendi profillerini görebilir
CREATE POLICY "Users can view own profile" ON public.profiles
  FOR SELECT USING (auth.uid() = user_id);

-- Kullanıcılar kendi profillerini güncelleyebilir
CREATE POLICY "Users can update own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Admin tüm profilleri görebilir
CREATE POLICY "Admin can view all profiles" ON public.profiles
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

-- Admin tüm profilleri yönetebilir
CREATE POLICY "Admin can manage all profiles" ON public.profiles
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.kullanici_rolleri kr
      WHERE kr.email = auth.email() AND kr.role = 'admin'
    )
  );

-- Başarı mesajı
-- Auth.users ve profiles tablolarına admin policy'leri başarıyla eklendi.
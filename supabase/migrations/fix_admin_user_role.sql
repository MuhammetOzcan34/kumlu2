-- Kullanıcıya admin rolü verme ve yetkilendirme
-- Bu migration mevcut kullanıcıyı admin yapar ve gerekli izinleri verir

-- 1. En son giriş yapan kullanıcıyı admin yap
UPDATE auth.users
SET raw_app_meta_data = jsonb_set(
  COALESCE(raw_app_meta_data, '{}'),
  '{role}',
  '"admin"',
  true
)
WHERE id = (
  SELECT id FROM auth.users 
  WHERE last_sign_in_at IS NOT NULL 
  ORDER BY last_sign_in_at DESC 
  LIMIT 1
);

-- 2. Profiles tablosunda da admin rolü ver
INSERT INTO profiles (user_id, display_name, role, created_at, updated_at)
SELECT 
  au.id,
  COALESCE(au.raw_user_meta_data->>'display_name', au.email),
  'admin',
  NOW(),
  NOW()
FROM auth.users au
WHERE au.last_sign_in_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM profiles p WHERE p.user_id = au.id
  )
ORDER BY au.last_sign_in_at DESC
LIMIT 1;

-- 3. Mevcut profile varsa güncelle
UPDATE profiles
SET role = 'admin', updated_at = NOW()
WHERE user_id = (
  SELECT id FROM auth.users 
  WHERE last_sign_in_at IS NOT NULL 
  ORDER BY last_sign_in_at DESC 
  LIMIT 1
);

-- 4. Kullanici_rolleri tablosuna da ekle (varsa)
INSERT INTO kullanici_rolleri (email, role, is_super_admin, created_at)
SELECT 
  au.email,
  'admin',
  true,
  NOW()
FROM auth.users au
WHERE au.last_sign_in_at IS NOT NULL
  AND NOT EXISTS (
    SELECT 1 FROM kullanici_rolleri kr WHERE kr.email = au.email
  )
ORDER BY au.last_sign_in_at DESC
LIMIT 1
ON CONFLICT (email) DO UPDATE SET
  role = 'admin',
  is_super_admin = true;

-- 5. Kategoriler tablosu için admin politikalarını yeniden oluştur
DROP POLICY IF EXISTS "Admin tam erişim" ON kategoriler;

CREATE POLICY "Admin tam erişim" ON kategoriler
    FOR ALL
    TO authenticated
    USING (
        (auth.jwt() ->> 'role')::text = 'admin' 
        OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
        OR EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role = 'admin'
        )
        OR EXISTS (
            SELECT 1 FROM auth.users au 
            WHERE au.id = auth.uid() 
            AND au.raw_app_meta_data->>'role' = 'admin'
        )
    )
    WITH CHECK (
        (auth.jwt() ->> 'role')::text = 'admin' 
        OR (auth.jwt() -> 'app_metadata' ->> 'role')::text = 'admin'
        OR EXISTS (
            SELECT 1 FROM profiles p 
            WHERE p.user_id = auth.uid() 
            AND p.role = 'admin'
        )
        OR EXISTS (
            SELECT 1 FROM auth.users au 
            WHERE au.id = auth.uid() 
            AND au.raw_app_meta_data->>'role' = 'admin'
        )
    );

-- 6. Kategoriler tablosuna gerekli izinleri ver
GRANT ALL PRIVILEGES ON kategoriler TO authenticated;
GRANT ALL PRIVILEGES ON kategoriler TO anon;

-- 7. Sequence izinleri (eğer varsa)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO authenticated;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO anon;

-- Sonuç kontrolü
SELECT 
    'Admin kullanıcı başarıyla oluşturuldu' as message,
    au.email,
    au.raw_app_meta_data->>'role' as app_metadata_role,
    p.role as profile_role
FROM auth.users au
LEFT JOIN profiles p ON au.id = p.user_id
WHERE au.last_sign_in_at IS NOT NULL
ORDER BY au.last_sign_in_at DESC
LIMIT 1;
-- Admin kullanıcısının metadata'sını kontrol et
SELECT 
  email,
  raw_app_meta_data,
  created_at
FROM auth.users 
WHERE email = 'admin@kumlu2.com';
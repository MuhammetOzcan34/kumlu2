-- Admin kullanıcı oluşturma fonksiyonunu kontrol et
SELECT 
    routine_name,
    routine_type
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name = 'create_admin_user'
ORDER BY routine_name;

-- Mevcut kullanıcı rollerini kontrol et
SELECT 
    ur.user_id,
    ur.role,
    p.email,
    p.full_name,
    p.created_at
FROM user_roles ur
LEFT JOIN profiles p ON ur.user_id = p.id
WHERE ur.role = 'admin'
ORDER BY p.created_at;

-- Admin kullanıcı oluşturma fonksiyonunu yeniden oluştur
CREATE OR REPLACE FUNCTION create_admin_user(
    user_email TEXT,
    user_password TEXT DEFAULT 'admin123',
    user_full_name TEXT DEFAULT 'Admin Kullanıcı'
)
RETURNS UUID AS $$
DECLARE
    new_user_id UUID;
    existing_user_id UUID;
BEGIN
    -- Kullanıcı zaten var mı kontrol et
    SELECT id INTO existing_user_id
    FROM profiles
    WHERE email = user_email;
    
    IF existing_user_id IS NOT NULL THEN
        -- Kullanıcı varsa, admin rolü var mı kontrol et
        IF NOT EXISTS (
            SELECT 1 FROM user_roles 
            WHERE user_id = existing_user_id AND role = 'admin'
        ) THEN
            -- Admin rolü yoksa ekle
            INSERT INTO user_roles (user_id, role)
            VALUES (existing_user_id, 'admin');
        END IF;
        
        RETURN existing_user_id;
    END IF;
    
    -- Yeni kullanıcı oluştur
    new_user_id := gen_random_uuid();
    
    -- Profile tablosuna ekle
    INSERT INTO profiles (
        id,
        email,
        full_name,
        created_at,
        updated_at
    ) VALUES (
        new_user_id,
        user_email,
        user_full_name,
        NOW(),
        NOW()
    );
    
    -- Admin rolü ekle
    INSERT INTO user_roles (user_id, role)
    VALUES (new_user_id, 'admin');
    
    RETURN new_user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Test admin kullanıcısı oluştur (eğer yoksa)
DO $$
DECLARE
    admin_user_id UUID;
BEGIN
    -- Test admin kullanıcısı oluştur
    SELECT create_admin_user(
        'admin@kumlu.com',
        'admin123',
        'Sistem Yöneticisi'
    ) INTO admin_user_id;
    
    RAISE NOTICE 'Admin kullanıcı ID: %', admin_user_id;
END
$$;

-- Admin kullanıcılarını listele
SELECT 
    p.id,
    p.email,
    p.full_name,
    ur.role,
    p.created_at
FROM profiles p
INNER JOIN user_roles ur ON p.id = ur.user_id
WHERE ur.role = 'admin'
ORDER BY p.created_at;
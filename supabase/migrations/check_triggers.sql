-- Mevcut trigger fonksiyonlarını kontrol et
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines 
WHERE routine_schema = 'public' 
    AND routine_name LIKE '%update%updated%at%'
ORDER BY routine_name;

-- Mevcut trigger'ları kontrol et
SELECT 
    trigger_name,
    event_object_table,
    action_timing,
    event_manipulation,
    action_statement
FROM information_schema.triggers 
WHERE trigger_schema = 'public'
    AND trigger_name LIKE '%updated_at%'
ORDER BY event_object_table;

-- update_updated_at_column fonksiyonunu oluştur (eğer yoksa)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Tüm tablolar için updated_at trigger'larını ekle
DO $$
DECLARE
    table_record RECORD;
    trigger_exists BOOLEAN;
BEGIN
    -- Her tablo için trigger kontrol et ve ekle
    FOR table_record IN 
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
            AND table_type = 'BASE TABLE'
            AND table_name NOT IN ('hesaplama_urunleri_backup')
    LOOP
        -- Bu tablo için updated_at kolonu var mı kontrol et
        IF EXISTS (
            SELECT 1 
            FROM information_schema.columns 
            WHERE table_schema = 'public' 
                AND table_name = table_record.table_name 
                AND column_name = 'updated_at'
        ) THEN
            -- Trigger zaten var mı kontrol et
            SELECT EXISTS (
                SELECT 1 
                FROM information_schema.triggers 
                WHERE trigger_schema = 'public' 
                    AND event_object_table = table_record.table_name 
                    AND trigger_name = 'update_' || table_record.table_name || '_updated_at'
            ) INTO trigger_exists;
            
            -- Trigger yoksa oluştur
            IF NOT trigger_exists THEN
                EXECUTE format('
                    CREATE TRIGGER update_%I_updated_at
                        BEFORE UPDATE ON %I
                        FOR EACH ROW
                        EXECUTE FUNCTION update_updated_at_column();
                ', table_record.table_name, table_record.table_name);
                
                RAISE NOTICE 'Trigger oluşturuldu: %', table_record.table_name;
            ELSE
                RAISE NOTICE 'Trigger zaten mevcut: %', table_record.table_name;
            END IF;
        END IF;
    END LOOP;
END
$$;
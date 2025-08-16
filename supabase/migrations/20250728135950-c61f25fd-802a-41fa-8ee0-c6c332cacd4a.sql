-- First check if enum exists, if not create it, then add arac-giydirme value
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'kategori_tip') THEN
        CREATE TYPE kategori_tip AS ENUM ('kumlama', 'tabela', 'arac-giydirme');
    ELSE
        -- Add the new value if it doesn't exist
        IF NOT EXISTS (SELECT 1 FROM pg_enum e JOIN pg_type t ON e.enumtypid = t.oid WHERE t.typname = 'kategori_tip' AND e.enumlabel = 'arac-giydirme') THEN
            ALTER TYPE kategori_tip ADD VALUE 'arac-giydirme';
        END IF;
    END IF;
END $$;
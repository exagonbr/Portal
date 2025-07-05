-- Script para adicionar colunas do Google OAuth na tabela user
-- Executar este script diretamente no banco de dados PostgreSQL

-- Verificar se as colunas já existem antes de adicionar
DO $$
BEGIN
    -- Adicionar google_id se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user' AND column_name = 'google_id') THEN
        ALTER TABLE "user" ADD COLUMN google_id VARCHAR(255) UNIQUE;
        RAISE NOTICE 'Coluna google_id adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna google_id já existe';
    END IF;

    -- Adicionar profile_image se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user' AND column_name = 'profile_image') THEN
        ALTER TABLE "user" ADD COLUMN profile_image VARCHAR(500);
        RAISE NOTICE 'Coluna profile_image adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna profile_image já existe';
    END IF;

    -- Adicionar email_verified se não existir
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'user' AND column_name = 'email_verified') THEN
        ALTER TABLE "user" ADD COLUMN email_verified BOOLEAN DEFAULT FALSE;
        RAISE NOTICE 'Coluna email_verified adicionada com sucesso';
    ELSE
        RAISE NOTICE 'Coluna email_verified já existe';
    END IF;
END $$; 
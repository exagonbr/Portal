-- Script para criar a tabela user e importar dados de User

-- Renomear a tabela User para User_temp (backup)
ALTER TABLE IF EXISTS "User" RENAME TO User_temp;

-- Criar nova tabela user
CREATE TABLE IF NOT EXISTS "user" (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    address VARCHAR(255),
    phone VARCHAR(255),
    usuario VARCHAR(255),
    role_id UUID,
    institution_id UUID,
    school_id UUID,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Copiar dados de User_temp para user
INSERT INTO "user" (
    id, name, email, password, address, phone, usuario, 
    role_id, institution_id, school_id, is_active, 
    created_at, updated_at
)
SELECT 
    id, name, email, password, address, phone, usuario, 
    role_id, institution_id, school_id, is_active, 
    created_at, updated_at
FROM User_temp;

-- Contagem de registros para verificação
SELECT COUNT(*) FROM "user"; 
-- Migration: Add Google OAuth fields to user table
-- Date: 2025-07-05
-- Description: Adiciona campos necessários para autenticação com Google OAuth

-- Adicionar campo google_id (ID único do Google)
ALTER TABLE user ADD COLUMN google_id VARCHAR(255) NULL UNIQUE COMMENT 'ID único do usuário no Google OAuth';

-- Adicionar campo profile_image (URL da imagem de perfil)
ALTER TABLE user ADD COLUMN profile_image VARCHAR(500) NULL COMMENT 'URL da imagem de perfil do usuário';

-- Adicionar campo email_verified (indica se o email foi verificado)
ALTER TABLE user ADD COLUMN email_verified BOOLEAN DEFAULT FALSE COMMENT 'Indica se o email do usuário foi verificado';

-- Criar índice para google_id para melhor performance
CREATE INDEX idx_user_google_id ON user(google_id);

-- Criar índice para email_verified para consultas de usuários verificados
CREATE INDEX idx_user_email_verified ON user(email_verified);

-- Comentários para documentação
COMMENT ON COLUMN user.google_id IS 'ID único do usuário no Google OAuth - usado para login social';
COMMENT ON COLUMN user.profile_image IS 'URL da imagem de perfil do usuário obtida do Google';
COMMENT ON COLUMN user.email_verified IS 'Indica se o email foi verificado (true para Google OAuth)';

-- Log da migração
INSERT INTO migration_log (migration_name, executed_at, description) 
VALUES ('20250705000000_add_google_oauth_fields', NOW(), 'Adicionados campos para Google OAuth: google_id, profile_image, email_verified')
ON CONFLICT DO NOTHING; 
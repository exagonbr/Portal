-- Rollback Migration: Remove Google OAuth fields from user table
-- Date: 2025-07-05
-- Description: Remove campos do Google OAuth da tabela user

-- ATENÇÃO: Este script irá remover permanentemente os dados dos campos do Google OAuth
-- Execute apenas se tiver certeza de que deseja reverter a migração

-- Remover índices primeiro
DROP INDEX IF EXISTS idx_user_google_id;
DROP INDEX IF EXISTS idx_user_email_verified;

-- Remover campos do Google OAuth
ALTER TABLE user DROP COLUMN IF EXISTS email_verified;
ALTER TABLE user DROP COLUMN IF EXISTS profile_image;
ALTER TABLE user DROP COLUMN IF EXISTS google_id;

-- Log do rollback
INSERT INTO migration_log (migration_name, executed_at, description) 
VALUES ('20250705000000_rollback_google_oauth_fields', NOW(), 'Removidos campos do Google OAuth: google_id, profile_image, email_verified')
ON CONFLICT DO NOTHING;

-- Mensagem de confirmação
SELECT 'Rollback concluído: Campos do Google OAuth removidos da tabela user' AS status; 
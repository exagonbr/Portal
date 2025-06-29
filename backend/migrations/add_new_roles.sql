-- Adicionar novos campos booleanos para os roles RBAC
-- Executar este script no banco de dados PostgreSQL

ALTER TABLE users ADD COLUMN IF NOT EXISTS is_institution_manager BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_coordinator BOOLEAN DEFAULT FALSE;
ALTER TABLE users ADD COLUMN IF NOT EXISTS is_guardian BOOLEAN DEFAULT FALSE;

-- Comentários para documentação
COMMENT ON COLUMN users.is_institution_manager IS 'Indica se o usuário é um Gerente de Instituição';
COMMENT ON COLUMN users.is_coordinator IS 'Indica se o usuário é um Coordenador';
COMMENT ON COLUMN users.is_guardian IS 'Indica se o usuário é um Responsável/Guardian';

-- Verificar se as colunas foram criadas
SELECT column_name, data_type, is_nullable, column_default 
FROM information_schema.columns 
WHERE table_name = 'users' 
AND column_name IN ('is_institution_manager', 'is_coordinator', 'is_guardian');
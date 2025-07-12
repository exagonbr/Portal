-- Criar tabela notification_templates se não existir
CREATE TABLE IF NOT EXISTS notification_templates (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    subject VARCHAR(500) NOT NULL,
    message TEXT,
    html BOOLEAN DEFAULT FALSE,
    category VARCHAR(100) DEFAULT 'custom',
    is_public BOOLEAN DEFAULT FALSE,
    user_id VARCHAR(50) NOT NULL,
    created_by VARCHAR(50) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Se a tabela já existir sem SERIAL, vamos tentar alterar
-- (isso falhará se a tabela não existir, mas não é problema)
DO $$
BEGIN
    -- Verificar se a coluna id não é SERIAL
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name = 'notification_templates' 
        AND column_name = 'id' 
        AND column_default IS NULL
    ) THEN
        -- Alterar a coluna id para ser SERIAL
        ALTER TABLE notification_templates 
        ALTER COLUMN id SET DEFAULT nextval('notification_templates_id_seq');
        
        -- Criar a sequência se não existir
        CREATE SEQUENCE IF NOT EXISTS notification_templates_id_seq;
        
        -- Definir a sequência como proprietária da coluna
        ALTER SEQUENCE notification_templates_id_seq OWNED BY notification_templates.id;
        
        -- Definir o valor atual da sequência
        SELECT setval('notification_templates_id_seq', COALESCE(MAX(id), 0) + 1, false) FROM notification_templates;
    END IF;
END $$; 
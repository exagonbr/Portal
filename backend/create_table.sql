-- Criar tabela user
CREATE TABLE IF NOT EXISTS "user" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    full_name VARCHAR(255),
    enabled BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuário admin se não existir
INSERT INTO "user" (email, password, full_name, enabled, is_active)
VALUES ('admin@sabercon.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', true, true)
ON CONFLICT (email) DO NOTHING; 
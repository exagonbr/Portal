-- Criar tabela users (plural, como esperado pela entidade User)
CREATE TABLE IF NOT EXISTS "users" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    full_name VARCHAR(255) NOT NULL,
    enabled BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false,
    is_manager BOOLEAN DEFAULT false,
    is_teacher BOOLEAN DEFAULT false,
    is_student BOOLEAN DEFAULT false,
    institution_id INTEGER,
    role_id INTEGER,
    address VARCHAR(255),
    phone VARCHAR(255),
    username VARCHAR(255) UNIQUE,
    google_id VARCHAR(255) UNIQUE,
    profile_image VARCHAR(500),
    email_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir usuário admin se não existir
INSERT INTO "users" (email, password, full_name, enabled, is_admin, is_manager, is_teacher, is_student)
VALUES ('admin@sabercon.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Admin', true, true, false, false, false)
ON CONFLICT (email) DO NOTHING;

-- Verificar se a tabela foi criada
SELECT 'Tabela users criada com sucesso!' as message; 
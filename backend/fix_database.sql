-- Limpar tabelas existentes
DROP TABLE IF EXISTS knex_migrations CASCADE;
DROP TABLE IF EXISTS "user" CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS institutions CASCADE;

-- Criar tabela roles
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela institutions
CREATE TABLE institutions (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    code VARCHAR(100) UNIQUE,
    type VARCHAR(50) DEFAULT 'SCHOOL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Criar tabela user
CREATE TABLE "user" (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255),
    full_name VARCHAR(255),
    name VARCHAR(255),
    enabled BOOLEAN DEFAULT true,
    is_active BOOLEAN DEFAULT true,
    is_admin BOOLEAN DEFAULT false,
    is_manager BOOLEAN DEFAULT false,
    is_teacher BOOLEAN DEFAULT false,
    is_student BOOLEAN DEFAULT false,
    role_id INTEGER REFERENCES roles(id),
    institution_id INTEGER REFERENCES institutions(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir roles básicos
INSERT INTO roles (name, description) VALUES 
('ADMIN', 'Administrador do sistema'),
('TEACHER', 'Professor'),
('STUDENT', 'Estudante'),
('MANAGER', 'Gestor');

-- Inserir instituição padrão
INSERT INTO institutions (name, code) VALUES 
('Portal Sabercon', 'SABERCON');

-- Criar um usuário admin padrão
INSERT INTO "user" (email, password, full_name, name, enabled, is_active, is_admin, role_id, institution_id) VALUES 
('admin@sabercon.com', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrador', 'Admin', true, true, true, 1, 1); 
-- Inserir usuários de teste com novos roles RBAC
-- Senha para todos: password123 (hash bcrypt com salt 12)

-- Primeiro, vamos limpar usuários de teste existentes
DELETE FROM users WHERE email LIKE '%@sabercon.edu.br';

-- Inserir usuários de teste
INSERT INTO users (
    id, 
    email, 
    password, 
    full_name, 
    is_admin, 
    is_institution_manager, 
    is_coordinator, 
    is_guardian, 
    is_teacher, 
    is_student, 
    enabled, 
    date_created, 
    last_updated
) VALUES 
-- SYSTEM_ADMIN
(
    gen_random_uuid(),
    'admin@sabercon.edu.br',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.',  -- password123
    'Administrador do Sistema',
    true,   -- is_admin
    false,  -- is_institution_manager
    false,  -- is_coordinator
    false,  -- is_guardian
    false,  -- is_teacher
    false,  -- is_student
    true,   -- enabled
    NOW(),
    NOW()
),
-- INSTITUTION_MANAGER
(
    gen_random_uuid(),
    'manager@sabercon.edu.br',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.',  -- password123
    'Gerente de Instituição',
    false,  -- is_admin
    true,   -- is_institution_manager
    false,  -- is_coordinator
    false,  -- is_guardian
    false,  -- is_teacher
    false,  -- is_student
    true,   -- enabled
    NOW(),
    NOW()
),
-- COORDINATOR
(
    gen_random_uuid(),
    'coordinator@sabercon.edu.br',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.',  -- password123
    'Coordenador Acadêmico',
    false,  -- is_admin
    false,  -- is_institution_manager
    true,   -- is_coordinator
    false,  -- is_guardian
    false,  -- is_teacher
    false,  -- is_student
    true,   -- enabled
    NOW(),
    NOW()
),
-- GUARDIAN
(
    gen_random_uuid(),
    'guardian@sabercon.edu.br',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.',  -- password123
    'Responsável Teste',
    false,  -- is_admin
    false,  -- is_institution_manager
    false,  -- is_coordinator
    true,   -- is_guardian
    false,  -- is_teacher
    false,  -- is_student
    true,   -- enabled
    NOW(),
    NOW()
),
-- TEACHER
(
    gen_random_uuid(),
    'teacher@sabercon.edu.br',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.',  -- password123
    'Professor Teste',
    false,  -- is_admin
    false,  -- is_institution_manager
    false,  -- is_coordinator
    false,  -- is_guardian
    true,   -- is_teacher
    false,  -- is_student
    true,   -- enabled
    NOW(),
    NOW()
),
-- STUDENT
(
    gen_random_uuid(),
    'student@sabercon.edu.br',
    '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/RK.PmvlG.',  -- password123
    'Estudante Teste',
    false,  -- is_admin
    false,  -- is_institution_manager
    false,  -- is_coordinator
    false,  -- is_guardian
    false,  -- is_teacher
    true,   -- is_student
    true,   -- enabled
    NOW(),
    NOW()
);

-- Verificar usuários criados
SELECT 
    email,
    full_name,
    CASE 
        WHEN is_admin THEN 'SYSTEM_ADMIN'
        WHEN is_institution_manager THEN 'INSTITUTION_MANAGER'
        WHEN is_coordinator THEN 'COORDINATOR'
        WHEN is_guardian THEN 'GUARDIAN'
        WHEN is_teacher THEN 'TEACHER'
        WHEN is_student THEN 'STUDENT'
        ELSE 'UNKNOWN'
    END as role,
    enabled
FROM users 
WHERE email LIKE '%@sabercon.edu.br'
ORDER BY 
    CASE 
        WHEN is_admin THEN 1
        WHEN is_institution_manager THEN 2
        WHEN is_coordinator THEN 3
        WHEN is_guardian THEN 4
        WHEN is_teacher THEN 5
        WHEN is_student THEN 6
        ELSE 7
    END;

-- Mostrar contagem por role
SELECT 
    'SYSTEM_ADMIN' as role,
    COUNT(*) as count
FROM users WHERE is_admin = true AND email LIKE '%@sabercon.edu.br'
UNION ALL
SELECT 
    'INSTITUTION_MANAGER' as role,
    COUNT(*) as count
FROM users WHERE is_institution_manager = true AND email LIKE '%@sabercon.edu.br'
UNION ALL
SELECT 
    'COORDINATOR' as role,
    COUNT(*) as count
FROM users WHERE is_coordinator = true AND email LIKE '%@sabercon.edu.br'
UNION ALL
SELECT 
    'GUARDIAN' as role,
    COUNT(*) as count
FROM users WHERE is_guardian = true AND email LIKE '%@sabercon.edu.br'
UNION ALL
SELECT 
    'TEACHER' as role,
    COUNT(*) as count
FROM users WHERE is_teacher = true AND email LIKE '%@sabercon.edu.br'
UNION ALL
SELECT 
    'STUDENT' as role,
    COUNT(*) as count
FROM users WHERE is_student = true AND email LIKE '%@sabercon.edu.br';
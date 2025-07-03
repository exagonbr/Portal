-- Script SQL para importar usuários da tabela legada "user" para a tabela atual "users"
-- 
-- Funcionalidades:
-- - Converte IDs inteiros da tabela legada para UUIDs na tabela atual
-- - Armazena o ID legado no campo user_id_legacy
-- - Define todos os usuários importados com role_id de TEACHER
-- - Evita duplicatas baseado no email e user_id_legacy

-- Configurações
\set TEACHER_ROLE_ID '5b80c403-086b-414f-8501-10cff41fc6c3'

-- Verificar se as tabelas existem
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user') THEN
        RAISE EXCEPTION 'Tabela legada "user" não encontrada';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'users') THEN
        RAISE EXCEPTION 'Tabela atual "users" não encontrada';
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM roles WHERE id = :'TEACHER_ROLE_ID') THEN
        RAISE EXCEPTION 'Role TEACHER não encontrada com ID: %', :'TEACHER_ROLE_ID';
    END IF;
    
    RAISE NOTICE 'Todas as verificações passaram. Iniciando importação...';
END $$;

-- Mostrar estatísticas antes da importação
SELECT 
    'ANTES DA IMPORTAÇÃO' as status,
    (SELECT COUNT(*) FROM "user") as usuarios_legados,
    (SELECT COUNT(*) FROM users) as usuarios_atuais,
    (SELECT COUNT(*) FROM users WHERE role_id = :'TEACHER_ROLE_ID') as teachers_atuais;

-- Criar função temporária para gerar hash de senha
CREATE OR REPLACE FUNCTION temp_hash_password(plain_password TEXT)
RETURNS TEXT AS $$
BEGIN
    -- Para senhas já hasheadas (começam com $2), retornar como está
    IF plain_password IS NOT NULL AND plain_password LIKE '$2%' THEN
        RETURN plain_password;
    END IF;
    
    -- Para senhas em texto plano ou NULL, usar senha padrão hasheada
    -- Hash de 'senha123' com bcrypt
    RETURN '$2a$12$rQJ8kHqBqTtVfwjNdHVuDOKmDFtXjRyqLrHZmFvxgZxGzJKqYvYoG';
END;
$$ LANGUAGE plpgsql;

-- Importar usuários da tabela legada para a atual
INSERT INTO users (
    id,
    email,
    password,
    name,
    cpf,
    phone,
    birth_date,
    address,
    city,
    state,
    zip_code,
    is_active,
    role_id,
    institution_id,
    school_id,
    user_id_legacy,
    created_at,
    updated_at
)
SELECT 
    gen_random_uuid() as id,
    COALESCE(u.email, 'user' || u.id || '@legado.com') as email,
    temp_hash_password(u.password) as password,
    COALESCE(u.full_name, 'Usuário ' || u.id) as name,
    u.cpf,
    COALESCE(u.phone, u.telefone) as phone,
    COALESCE(u.birth_date, u.data_nascimento) as birth_date,
    COALESCE(u.address, u.endereco) as address,
    COALESCE(u.city, u.cidade) as city,
    COALESCE(u.state, u.estado) as state,
    COALESCE(u.zip_code, u.cep) as zip_code,
    COALESCE(u.is_active, true) as is_active,
    :'TEACHER_ROLE_ID'::uuid as role_id,
    u.institution_id,
    u.school_id,
    u.id as user_id_legacy,
    COALESCE(u.created_at, NOW()) as created_at,
    COALESCE(u.updated_at, NOW()) as updated_at
FROM "user" u
WHERE NOT EXISTS (
    -- Evitar duplicatas por email
    SELECT 1 FROM users WHERE users.email = COALESCE(u.email, 'user' || u.id || '@legado.com')
)
AND NOT EXISTS (
    -- Evitar duplicatas por user_id_legacy
    SELECT 1 FROM users WHERE users.user_id_legacy = u.id
);

-- Remover função temporária
DROP FUNCTION temp_hash_password(TEXT);

-- Mostrar estatísticas após a importação
SELECT 
    'APÓS A IMPORTAÇÃO' as status,
    (SELECT COUNT(*) FROM "user") as usuarios_legados,
    (SELECT COUNT(*) FROM users) as usuarios_atuais,
    (SELECT COUNT(*) FROM users WHERE role_id = :'TEACHER_ROLE_ID') as teachers_atuais,
    (SELECT COUNT(*) FROM users WHERE user_id_legacy IS NOT NULL) as usuarios_importados;

-- Mostrar alguns exemplos dos usuários importados
SELECT 
    'EXEMPLOS DE USUÁRIOS IMPORTADOS' as info,
    id,
    email,
    name,
    user_id_legacy,
    created_at
FROM users 
WHERE user_id_legacy IS NOT NULL 
ORDER BY user_id_legacy 
LIMIT 5;

-- Verificar se há emails duplicados
SELECT 
    'VERIFICAÇÃO DE DUPLICATAS' as info,
    email,
    COUNT(*) as quantidade
FROM users 
GROUP BY email 
HAVING COUNT(*) > 1;

-- Relatório final
DO $$
DECLARE
    total_importados INTEGER;
    total_usuarios INTEGER;
BEGIN
    SELECT COUNT(*) INTO total_importados FROM users WHERE user_id_legacy IS NOT NULL;
    SELECT COUNT(*) INTO total_usuarios FROM users;
    
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'RELATÓRIO FINAL DA IMPORTAÇÃO';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Usuários importados: %', total_importados;
    RAISE NOTICE 'Total de usuários na tabela: %', total_usuarios;
    RAISE NOTICE 'Role definida: TEACHER (%)', :'TEACHER_ROLE_ID';
    RAISE NOTICE 'Senha padrão para usuários sem senha: senha123';
    RAISE NOTICE '';
    RAISE NOTICE 'Próximos passos recomendados:';
    RAISE NOTICE '1. Verificar os usuários importados no sistema';
    RAISE NOTICE '2. Notificar os usuários sobre suas credenciais';
    RAISE NOTICE '3. Configurar instituições e escolas se necessário';
    RAISE NOTICE '========================================';
END $$; 
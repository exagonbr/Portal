#!/bin/bash

# Script para criar Admin Master - Portal Educacional
# Aproveita a estrutura modular e dados migrados

set -e

# Cores para output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}👑 CRIANDO ADMIN MASTER - PORTAL EDUCACIONAL${NC}"
echo "=================================================="
echo ""

# Verificar se estamos no diretório correto
if [ ! -f "package.json" ]; then
    echo -e "${RED}❌ Execute este script na raiz do projeto Portal${NC}"
    exit 1
fi

# Verificar se o backend existe
if [ ! -d "backend" ]; then
    echo -e "${RED}❌ Diretório backend não encontrado${NC}"
    exit 1
fi

echo -e "${BLUE}📋 Dados do Admin Master:${NC}"
echo "Email: maia.cspg@gmail.com"
echo "Senha: maia.cspg@gmail.com"
echo "Role: admin_master"
echo ""

# Verificar dependências
echo -e "${YELLOW}🔍 Verificando dependências...${NC}"

# Ir para o backend
cd backend

# Verificar se node_modules existe
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Instalando dependências do backend...${NC}"
    npm install
fi

# Verificar se bcryptjs está instalado
if ! npm list bcryptjs >/dev/null 2>&1; then
    echo -e "${YELLOW}📦 Instalando bcryptjs...${NC}"
    npm install bcryptjs
fi

# Verificar se uuid está instalado
if ! npm list uuid >/dev/null 2>&1; then
    echo -e "${YELLOW}📦 Instalando uuid...${NC}"
    npm install uuid
fi

# Verificar se knex está instalado
if ! npm list knex >/dev/null 2>&1; then
    echo -e "${YELLOW}📦 Instalando knex...${NC}"
    npm install knex
fi

# Verificar se pg está instalado
if ! npm list pg >/dev/null 2>&1; then
    echo -e "${YELLOW}📦 Instalando driver PostgreSQL...${NC}"
    npm install pg
fi

echo -e "${GREEN}✅ Dependências verificadas${NC}"

# Executar script de criação
echo ""
echo -e "${BLUE}🚀 Executando criação do Admin Master...${NC}"

if [ -f "scripts/create-admin-master.js" ]; then
    node scripts/create-admin-master.js
else
    echo -e "${RED}❌ Script create-admin-master.js não encontrado em backend/scripts/${NC}"
    echo ""
    echo -e "${YELLOW}💡 Criando Admin Master diretamente via SQL...${NC}"
    
    # Criar script SQL temporário
    cat > /tmp/create_admin.sql << EOF
-- Criação do Admin Master via SQL
-- Email: maia.cspg@gmail.com
-- Senha: maia.cspg@gmail.com (será hasheada)

-- Verificar se usuário já existe
DO \$\$
DECLARE
    user_exists boolean;
    user_id uuid;
    hashed_password text;
BEGIN
    -- Verificar se usuário existe
    SELECT EXISTS(SELECT 1 FROM users WHERE email = 'maia.cspg@gmail.com') INTO user_exists;
    
    IF user_exists THEN
        RAISE NOTICE 'Admin com email já existe. Atualizando...';
        
        -- Atualizar usuário existente
        UPDATE users SET
            name = 'Admin Master',
            role = 'admin_master',
            is_active = true,
            is_verified = true,
            updated_at = NOW(),
            permissions = '["admin_master","user_management","institution_management","content_management","analytics_access","system_settings","backup_restore","migration_control"]'::jsonb,
            metadata = '{"admin_level":"master","created_by":"sql_script","admin_notes":"Admin Master criado via script SQL","access_level":"unlimited"}'::jsonb
        WHERE email = 'maia.cspg@gmail.com';
        
    ELSE
        -- Gerar UUID para novo usuário
        user_id := gen_random_uuid();
        
        RAISE NOTICE 'Criando novo Admin Master...';
        
        -- Inserir novo admin (senha precisa ser hasheada pela aplicação)
        INSERT INTO users (
            id,
            email,
            name,
            password,
            role,
            is_active,
            is_verified,
            email_verified_at,
            created_at,
            updated_at,
            permissions,
            metadata
        ) VALUES (
            user_id,
            'maia.cspg@gmail.com',
            'Admin Master',
            '\$2a\$12\$placeholder.hash.will.be.updated', -- Placeholder - senha precisa ser atualizada
            'admin_master',
            true,
            true,
            NOW(),
            NOW(),
            NOW(),
            '["admin_master","user_management","institution_management","content_management","analytics_access","system_settings","backup_restore","migration_control"]'::jsonb,
            '{"admin_level":"master","created_by":"sql_script","admin_notes":"Admin Master criado via script SQL - IMPORTANTE: Atualizar senha via aplicação","access_level":"unlimited"}'::jsonb
        );
        
        -- Criar perfil se tabela existir
        IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_profiles') THEN
            INSERT INTO user_profiles (
                id,
                user_id,
                bio,
                preferences,
                created_at,
                updated_at
            ) VALUES (
                gen_random_uuid(),
                user_id,
                'Administrador Master do Portal Educacional',
                '{"theme":"dark","language":"pt-BR","notifications":{"email":true,"push":true,"sms":false},"dashboard":{"layout":"admin","widgets":["users","content","analytics","system"]}}'::jsonb,
                NOW(),
                NOW()
            );
        END IF;
    END IF;
    
    RAISE NOTICE 'Admin Master configurado com sucesso!';
    RAISE NOTICE 'IMPORTANTE: A senha precisa ser definida via aplicação devido ao hash bcrypt';
    
END\$\$;

-- Exibir informações do admin criado
SELECT 
    id,
    email,
    name,
    role,
    is_active,
    created_at,
    permissions
FROM users 
WHERE email = 'maia.cspg@gmail.com';
EOF

    echo ""
    echo -e "${YELLOW}📝 Script SQL criado. Aplicando no banco...${NC}"
    echo ""
    echo -e "${BLUE}💡 Credenciais de conexão:${NC}"
    echo "Host: ${DB_HOST:-localhost}"
    echo "Porta: ${DB_PORT:-5432}"
    echo "Usuário: ${DB_USER:-postgres}"
    echo "Banco: ${DB_NAME:-portal_educacional}"
    echo ""
    
    # Tentar conectar e executar SQL
    if command -v psql >/dev/null 2>&1; then
        echo -e "${BLUE}🔌 Conectando ao PostgreSQL...${NC}"
        
        # Usar variáveis de ambiente ou padrões
        PGHOST=${DB_HOST:-localhost}
        PGPORT=${DB_PORT:-5432}
        PGUSER=${DB_USER:-postgres}
        PGDATABASE=${DB_NAME:-portal_educacional}
        
        export PGHOST PGPORT PGUSER PGDATABASE
        
        if psql -f /tmp/create_admin.sql; then
            echo ""
            echo -e "${GREEN}✅ Admin Master criado com sucesso!${NC}"
            echo ""
            echo -e "${YELLOW}⚠️  IMPORTANTE:${NC}"
            echo "A senha foi criada com um placeholder."
            echo "Para definir a senha correta, execute:"
            echo ""
            echo "UPDATE users SET password = crypt('maia.cspg@gmail.com', gen_salt('bf')) WHERE email = 'maia.cspg@gmail.com';"
            echo ""
            echo "Ou use a aplicação para redefinir a senha."
        else
            echo ""
            echo -e "${RED}❌ Erro ao executar script SQL${NC}"
            echo ""
            echo -e "${YELLOW}💡 Execute manualmente:${NC}"
            echo "psql -h ${PGHOST} -p ${PGPORT} -U ${PGUSER} -d ${PGDATABASE} -f /tmp/create_admin.sql"
        fi
    else
        echo -e "${YELLOW}⚠️  psql não encontrado${NC}"
        echo ""
        echo -e "${BLUE}📄 Script SQL criado em: /tmp/create_admin.sql${NC}"
        echo "Execute manualmente no PostgreSQL."
    fi
    
    # Limpar arquivo temporário
    rm -f /tmp/create_admin.sql
fi

# Voltar ao diretório raiz
cd ..

echo ""
echo -e "${GREEN}🎉 Processo concluído!${NC}"
echo ""
echo -e "${BLUE}📋 PRÓXIMOS PASSOS:${NC}"
echo "1. Teste o login com:"
echo "   Email: maia.cspg@gmail.com"
echo "   Senha: maia.cspg@gmail.com"
echo ""
echo "2. Altere a senha após o primeiro login"
echo ""
echo "3. Configure o sistema conforme necessário"
echo ""
echo -e "${YELLOW}💡 Se houver problemas de senha, use a aplicação para redefinir${NC}" 
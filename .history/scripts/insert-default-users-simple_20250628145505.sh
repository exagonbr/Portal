#!/bin/bash

# Script simplificado para inserir usuários padrão apenas na tabela 'users'
# Use este script se a tabela 'user' tiver estrutura incompatível

# Configurações do banco de dados
DB_HOST="${DB_HOST:-localhost}"
DB_PORT="${DB_PORT:-5432}"
DB_NAME="${DB_NAME:-portal}"
DB_USER="${DB_USER:-postgres}"
DB_PASSWORD="${DB_PASSWORD:-}"

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para executar comandos SQL
execute_sql() {
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c "$1"
}

# Função para executar comandos SQL e retornar resultado
query_sql() {
    PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -t -c "$1"
}

echo -e "${BLUE}================================================${NC}"
echo -e "${BLUE}   Script Simplificado - Apenas tabela 'users'${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Verificar conexão com o banco
echo -e "${YELLOW}Verificando conexão com o banco de dados...${NC}"
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c '\q' 2>/dev/null; then
    echo -e "${RED}❌ Erro: Não foi possível conectar ao banco de dados${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Conexão estabelecida com sucesso${NC}"
echo ""

# Verificar se a tabela 'users' existe
USERS_TABLE_EXISTS=$(query_sql "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users');" | tr -d ' ')

if [ "$USERS_TABLE_EXISTS" != "t" ]; then
    echo -e "${RED}❌ Erro: Tabela 'users' não encontrada${NC}"
    exit 1
fi

echo -e "${GREEN}✅ Tabela 'users' encontrada${NC}"
echo ""

# Hash da senha padrão (password123)
PASSWORD_HASH='$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGSzLmNrJee'

# Criar instituições
echo -e "${YELLOW}Criando instituições...${NC}"

# Sabercon
SABERCON_ID=$(query_sql "
    SELECT id FROM institution WHERE name = 'Sabercon Educação' LIMIT 1;
" | tr -d ' ')

if [ -z "$SABERCON_ID" ]; then
    SABERCON_ID=$(query_sql "
        INSERT INTO institution (
            name, company_name, accountable_name, accountable_contact,
            document, street, district, state, postal_code,
            contract_disabled, contract_term_start, contract_term_end,
            deleted, has_library_platform, has_principal_platform, has_student_platform
        ) VALUES (
            'Sabercon Educação', 'Sabercon Educação LTDA', 'Administrador Sistema', 'admin@sabercon.edu.br',
            '00.000.000/0001-00', 'Rua Principal, 123', 'Centro', 'SP', '00000-000',
            false, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year',
            false, true, true, true
        )
        RETURNING id;
    " | tr -d ' ')
fi

echo -e "${GREEN}✅ Instituição Sabercon (ID: $SABERCON_ID)${NC}"

# IFSP
IFSP_ID=$(query_sql "
    SELECT id FROM institution WHERE name = 'Instituto Federal de São Paulo' LIMIT 1;
" | tr -d ' ')

if [ -z "$IFSP_ID" ]; then
    IFSP_ID=$(query_sql "
        INSERT INTO institution (
            name, company_name, accountable_name, accountable_contact,
            document, street, district, state, postal_code,
            contract_disabled, contract_term_start, contract_term_end,
            deleted, has_library_platform, has_principal_platform, has_student_platform
        ) VALUES (
            'Instituto Federal de São Paulo', 'IFSP - Instituto Federal de São Paulo', 'Diretor IFSP', 'contato@ifsp.edu.br',
            '11.111.111/0001-11', 'Av. Federal, 456', 'Centro Educacional', 'SP', '11111-111',
            false, CURRENT_DATE, CURRENT_DATE + INTERVAL '1 year',
            false, true, true, true
        )
        RETURNING id;
    " | tr -d ' ')
fi

echo -e "${GREEN}✅ Instituição IFSP (ID: $IFSP_ID)${NC}"
echo ""

# Criar roles simplificadas
echo -e "${YELLOW}Criando roles...${NC}"

# Função simplificada para criar role
create_simple_role() {
    local role_name=$1
    local role_description=$2
    
    local role_id=$(query_sql "SELECT id FROM roles WHERE name = '$role_name' LIMIT 1;" | tr -d ' ')
    
    if [ -z "$role_id" ]; then
        role_id=$(query_sql "
            INSERT INTO roles (id, name, description, type, status, active, user_count, created_at, updated_at)
            VALUES (gen_random_uuid(), '$role_name', '$role_description', 'system', 'active', true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            RETURNING id;
        " | tr -d ' ')
    fi
    
    echo "$role_id"
}

# Criar roles
SYSTEM_ADMIN_ID=$(create_simple_role "SYSTEM_ADMIN" "Administrador do Sistema")
echo -e "${GREEN}✅ Role SYSTEM_ADMIN${NC}"

INSTITUTION_MANAGER_ID=$(create_simple_role "INSTITUTION_MANAGER" "Gestor Institucional")
echo -e "${GREEN}✅ Role INSTITUTION_MANAGER${NC}"

TEACHER_ID=$(create_simple_role "TEACHER" "Professor")
echo -e "${GREEN}✅ Role TEACHER${NC}"

STUDENT_ID=$(create_simple_role "STUDENT" "Estudante")
echo -e "${GREEN}✅ Role STUDENT${NC}"

COORDINATOR_ID=$(create_simple_role "ACADEMIC_COORDINATOR" "Coordenador Acadêmico")
echo -e "${GREEN}✅ Role ACADEMIC_COORDINATOR${NC}"

GUARDIAN_ID=$(create_simple_role "GUARDIAN" "Responsável")
echo -e "${GREEN}✅ Role GUARDIAN${NC}"
echo ""

# Criar usuários apenas na tabela 'users'
echo -e "${YELLOW}Criando usuários na tabela 'users'...${NC}"
echo ""

# Função para criar usuário
create_user_simple() {
    local email=$1
    local name=$2
    local role_id=$3
    local institution_id=$4
    
    # Verificar se usuário já existe
    local user_exists=$(query_sql "SELECT EXISTS (SELECT FROM users WHERE email = '$email');" | tr -d ' ')
    
    if [ "$user_exists" = "t" ]; then
        execute_sql "
            UPDATE users 
            SET role_id = '$role_id',
                is_active = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE email = '$email';
        " >/dev/null 2>&1
        echo -e "   ${YELLOW}↻ Usuário $email atualizado${NC}"
    else
        execute_sql "
            INSERT INTO users (
                id, email, password, name,
                is_active, role_id, institution_id,
                created_at, updated_at
            ) VALUES (
                gen_random_uuid(), '$email', '$PASSWORD_HASH', '$name',
                true, '$role_id', '$institution_id',
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            );
        " >/dev/null 2>&1
        echo -e "   ${GREEN}✅ Usuário $email criado${NC}"
    fi
}

# Criar usuários
echo -e "${BLUE}👤 admin@sabercon.edu.br${NC}"
create_user_simple "admin@sabercon.edu.br" "Administrador do Sistema" "$SYSTEM_ADMIN_ID" "$SABERCON_ID"

echo -e "${BLUE}👤 gestor@sabercon.edu.br${NC}"
create_user_simple "gestor@sabercon.edu.br" "Gestor Institucional" "$INSTITUTION_MANAGER_ID" "$SABERCON_ID"

echo -e "${BLUE}👤 professor@sabercon.edu.br${NC}"
create_user_simple "professor@sabercon.edu.br" "Professor do Sistema" "$TEACHER_ID" "$SABERCON_ID"

echo -e "${BLUE}👤 julia.c@ifsp.com${NC}"
create_user_simple "julia.c@ifsp.com" "Julia Costa Ferreira" "$STUDENT_ID" "$IFSP_ID"

echo -e "${BLUE}👤 coordenador@sabercon.edu.com${NC}"
create_user_simple "coordenador@sabercon.edu.com" "Coordenador Acadêmico" "$COORDINATOR_ID" "$SABERCON_ID"

echo -e "${BLUE}👤 renato@gmail.com${NC}"
create_user_simple "renato@gmail.com" "Renato Oliveira Silva" "$GUARDIAN_ID" "$SABERCON_ID"

echo ""
echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ Script concluído com sucesso!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${BLUE}📋 Resumo:${NC}"
echo -e "   • 2 instituições verificadas/criadas"
echo -e "   • 6 roles verificadas/criadas"
echo -e "   • 6 usuários processados na tabela 'users'"
echo ""
echo -e "${YELLOW}🔑 Senha padrão: password123${NC}"
echo -e "${YELLOW}⚠️  Altere as senhas após o primeiro login${NC}"
echo ""
echo -e "${BLUE}ℹ️  Nota: Este script insere apenas na tabela 'users'${NC}"
echo -e "${BLUE}   Se precisar inserir na tabela 'user', execute:${NC}"
echo -e "${BLUE}   bash scripts/fix-user-table.sh${NC}"
echo ""
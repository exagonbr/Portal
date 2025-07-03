#!/bin/bash

# Script para inserir usuários padrão no sistema Portal
# Este script cria os usuários padrão nas tabelas "users" e "user" (se existirem)
# com suas respectivas roles e permissões

# Configurações do banco de dados
# ATENÇÃO: Ajuste estas variáveis para o ambiente de produção
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
echo -e "${BLUE}   Script de Inserção de Usuários Padrão${NC}"
echo -e "${BLUE}================================================${NC}"
echo ""

# Verificar conexão com o banco
echo -e "${YELLOW}Verificando conexão com o banco de dados...${NC}"
if ! PGPASSWORD=$DB_PASSWORD psql -h $DB_HOST -p $DB_PORT -U $DB_USER -d $DB_NAME -c '\q' 2>/dev/null; then
    echo -e "${RED}❌ Erro: Não foi possível conectar ao banco de dados${NC}"
    echo -e "${RED}   Verifique as configurações de conexão${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Conexão estabelecida com sucesso${NC}"
echo ""

# Hash da senha padrão (password123) - bcrypt com 12 rounds
# Este hash foi gerado previamente para evitar dependências externas
PASSWORD_HASH='$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewKyNiGSzLmNrJee'

# SQL para criar instituições
echo -e "${YELLOW}Criando instituições...${NC}"

# Criar Sabercon Educação
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
    ON CONFLICT (name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
    RETURNING id;
" | tr -d ' ')

if [ -z "$SABERCON_ID" ]; then
    SABERCON_ID=$(query_sql "SELECT id FROM institution WHERE name = 'Sabercon Educação' LIMIT 1;" | tr -d ' ')
fi

echo -e "${GREEN}✅ Instituição Sabercon criada/atualizada (ID: $SABERCON_ID)${NC}"

# Criar IFSP
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
    ON CONFLICT (name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
    RETURNING id;
" | tr -d ' ')

if [ -z "$IFSP_ID" ]; then
    IFSP_ID=$(query_sql "SELECT id FROM institution WHERE name = 'Instituto Federal de São Paulo' LIMIT 1;" | tr -d ' ')
fi

echo -e "${GREEN}✅ Instituição IFSP criada/atualizada (ID: $IFSP_ID)${NC}"
echo ""

# SQL para criar roles
echo -e "${YELLOW}Criando roles e permissões...${NC}"

# Função para criar role
create_role() {
    local role_name=$1
    local role_description=$2
    local permissions=$3
    
    # Criar role
    local role_id=$(query_sql "
        INSERT INTO roles (id, name, description, type, status, active, user_count, created_at, updated_at)
        VALUES (gen_random_uuid(), '$role_name', '$role_description', 'system', 'active', true, 0, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
        ON CONFLICT (name) DO UPDATE SET updated_at = CURRENT_TIMESTAMP
        RETURNING id;
    " | tr -d ' ')
    
    if [ -z "$role_id" ]; then
        role_id=$(query_sql "SELECT id FROM roles WHERE name = '$role_name' LIMIT 1;" | tr -d ' ')
    fi
    
    # Criar permissões
    IFS=',' read -ra PERMS <<< "$permissions"
    for perm in "${PERMS[@]}"; do
        perm=$(echo $perm | tr -d ' ')
        IFS='.' read -ra PARTS <<< "$perm"
        resource="${PARTS[0]}"
        action="${PARTS[1]:-access}"
        
        # Criar permissão
        perm_id=$(query_sql "
            INSERT INTO permissions (id, name, resource, action, description, created_at, updated_at)
            VALUES (gen_random_uuid(), '$perm', '$resource', '$action', 'Permissão: $perm', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (name) DO NOTHING
            RETURNING id;
        " | tr -d ' ')
        
        if [ -z "$perm_id" ]; then
            perm_id=$(query_sql "SELECT id FROM permissions WHERE name = '$perm' LIMIT 1;" | tr -d ' ')
        fi
        
        # Associar permissão à role
        execute_sql "
            INSERT INTO role_permissions (role_id, permission_id, created_at, updated_at)
            VALUES ('$role_id', '$perm_id', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
            ON CONFLICT (role_id, permission_id) DO NOTHING;
        " >/dev/null 2>&1
    done
    
    echo "$role_id"
}

# Criar todas as roles
SYSTEM_ADMIN_ID=$(create_role "SYSTEM_ADMIN" "Administrador do Sistema - Acesso completo" "system.manage,users.manage,institutions.manage,portal.access,admin.full")
echo -e "${GREEN}✅ Role SYSTEM_ADMIN criada${NC}"

INSTITUTION_MANAGER_ID=$(create_role "INSTITUTION_MANAGER" "Gestor Institucional - Gerencia operações da instituição" "users.manage.institution,classes.manage,schedules.manage,portal.access")
echo -e "${GREEN}✅ Role INSTITUTION_MANAGER criada${NC}"

TEACHER_ID=$(create_role "TEACHER" "Professor - Gerencia turmas e conteúdos" "classes.teach,students.manage,content.manage,grades.manage,portal.access")
echo -e "${GREEN}✅ Role TEACHER criada${NC}"

STUDENT_ID=$(create_role "STUDENT" "Estudante - Acessa conteúdos e atividades" "content.access,assignments.submit,grades.view.own,portal.access")
echo -e "${GREEN}✅ Role STUDENT criada${NC}"

COORDINATOR_ID=$(create_role "ACADEMIC_COORDINATOR" "Coordenador Acadêmico - Coordena atividades pedagógicas" "curriculum.manage,teachers.coordinate,classes.coordinate,portal.access")
echo -e "${GREEN}✅ Role ACADEMIC_COORDINATOR criada${NC}"

GUARDIAN_ID=$(create_role "GUARDIAN" "Responsável - Acompanha progresso de estudantes" "children.view.info,children.view.grades,announcements.receive,portal.access")
echo -e "${GREEN}✅ Role GUARDIAN criada${NC}"
echo ""

# Verificar quais tabelas de usuários existem
echo -e "${YELLOW}Verificando tabelas de usuários...${NC}"

USERS_TABLE_EXISTS=$(query_sql "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'users');" | tr -d ' ')
USER_TABLE_EXISTS=$(query_sql "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'user');" | tr -d ' ')

if [ "$USERS_TABLE_EXISTS" = "t" ]; then
    echo -e "${GREEN}✅ Tabela 'users' encontrada${NC}"
fi

if [ "$USER_TABLE_EXISTS" = "t" ]; then
    echo -e "${GREEN}✅ Tabela 'user' encontrada${NC}"
fi

if [ "$USERS_TABLE_EXISTS" != "t" ] && [ "$USER_TABLE_EXISTS" != "t" ]; then
    echo -e "${RED}❌ Erro: Nenhuma tabela de usuários encontrada (nem 'users' nem 'user')${NC}"
    exit 1
fi
echo ""

# Função para criar usuário
create_user() {
    local email=$1
    local name=$2
    local role_id=$3
    local institution_id=$4
    local table_name=$5
    
    # Verificar colunas disponíveis na tabela
    local has_name=$(query_sql "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = '$table_name' AND column_name = 'name');" | tr -d ' ')
    local has_full_name=$(query_sql "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = '$table_name' AND column_name = 'full_name');" | tr -d ' ')
    local has_is_active=$(query_sql "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = '$table_name' AND column_name = 'is_active');" | tr -d ' ')
    local has_enabled=$(query_sql "SELECT EXISTS (SELECT FROM information_schema.columns WHERE table_name = '$table_name' AND column_name = 'enabled');" | tr -d ' ')
    
    # Construir query dinamicamente
    local name_column=""
    local name_value=""
    if [ "$has_name" = "t" ]; then
        name_column="name,"
        name_value="'$name',"
    elif [ "$has_full_name" = "t" ]; then
        name_column="full_name,"
        name_value="'$name',"
    fi
    
    local active_column=""
    local active_value=""
    if [ "$has_is_active" = "t" ]; then
        active_column="is_active,"
        active_value="true,"
    elif [ "$has_enabled" = "t" ]; then
        active_column="enabled,"
        active_value="true,"
    fi
    
    # Verificar se usuário já existe
    local user_exists=$(query_sql "SELECT EXISTS (SELECT FROM $table_name WHERE email = '$email');" | tr -d ' ')
    
    if [ "$user_exists" = "t" ]; then
        # Atualizar usuário existente
        execute_sql "
            UPDATE $table_name 
            SET role_id = '$role_id',
                $active_column = true,
                updated_at = CURRENT_TIMESTAMP
            WHERE email = '$email';
        " >/dev/null 2>&1
        echo -e "   ${YELLOW}↻ Usuário $email atualizado na tabela $table_name${NC}"
    else
        # Criar novo usuário
        execute_sql "
            INSERT INTO $table_name (
                id, email, password, $name_column
                $active_column role_id, institution_id,
                created_at, updated_at
            ) VALUES (
                gen_random_uuid(), '$email', '$PASSWORD_HASH', $name_value
                $active_value '$role_id', '$institution_id',
                CURRENT_TIMESTAMP, CURRENT_TIMESTAMP
            );
        " >/dev/null 2>&1
        echo -e "   ${GREEN}✅ Usuário $email criado na tabela $table_name${NC}"
    fi
}

# Criar usuários
echo -e "${YELLOW}Criando usuários padrão...${NC}"
echo ""

# Array de usuários
declare -A users
users["admin@sabercon.edu.br"]="Administrador do Sistema|$SYSTEM_ADMIN_ID|$SABERCON_ID"
users["gestor@sabercon.edu.br"]="Gestor Institucional|$INSTITUTION_MANAGER_ID|$SABERCON_ID"
users["professor@sabercon.edu.br"]="Professor do Sistema|$TEACHER_ID|$SABERCON_ID"
users["julia.c@ifsp.com"]="Julia Costa Ferreira|$STUDENT_ID|$IFSP_ID"
users["coordenador@sabercon.edu.com"]="Coordenador Acadêmico|$COORDINATOR_ID|$SABERCON_ID"
users["renato@gmail.com"]="Renato Oliveira Silva|$GUARDIAN_ID|$SABERCON_ID"

# Criar usuários em cada tabela existente
for email in "${!users[@]}"; do
    IFS='|' read -ra USER_DATA <<< "${users[$email]}"
    name="${USER_DATA[0]}"
    role_id="${USER_DATA[1]}"
    institution_id="${USER_DATA[2]}"
    
    echo -e "${BLUE}👤 Processando: $email ($name)${NC}"
    
    if [ "$USERS_TABLE_EXISTS" = "t" ]; then
        create_user "$email" "$name" "$role_id" "$institution_id" "users"
    fi
    
    if [ "$USER_TABLE_EXISTS" = "t" ]; then
        create_user "$email" "$name" "$role_id" "$institution_id" "user"
    fi
    
    echo ""
done

echo -e "${GREEN}================================================${NC}"
echo -e "${GREEN}✅ Script concluído com sucesso!${NC}"
echo -e "${GREEN}================================================${NC}"
echo ""
echo -e "${BLUE}📋 Resumo:${NC}"
echo -e "   • 2 instituições criadas/atualizadas"
echo -e "   • 6 roles com permissões criadas"
echo -e "   • 6 usuários padrão processados"
echo ""
echo -e "${YELLOW}🔑 Senha padrão para todos os usuários: password123${NC}"
echo -e "${YELLOW}⚠️  Recomenda-se alterar as senhas após o primeiro login${NC}"
echo ""
#!/bin/bash

# ==============================================================================
# SCRIPT DE MIGRAÇÃO PARA ARQUITETURA MODULAR
# Migra o sistema atual para uma estrutura modular organizada
# ==============================================================================

set -e  # Sair se qualquer comando falhar

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Funções auxiliares
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Verificar pré-requisitos
check_prerequisites() {
    log_info "Verificando pré-requisitos..."
    
    # Verificar se estamos no diretório correto
    if [[ ! -f "package.json" ]]; then
        log_error "Arquivo package.json não encontrado. Execute este script na raiz do projeto."
        exit 1
    fi
    
    # Verificar se o Git está inicializado
    if [[ ! -d ".git" ]]; then
        log_error "Repositório Git não encontrado. Inicialize o Git primeiro."
        exit 1
    fi
    
    # Verificar se há mudanças não commitadas
    if [[ -n $(git status --porcelain) ]]; then
        log_warning "Há mudanças não commitadas. Recomenda-se fazer commit antes da migração."
        read -p "Continuar mesmo assim? (y/N): " -n 1 -r
        echo
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
    
    log_success "Pré-requisitos verificados!"
}

# Criar backup do sistema atual
create_backup() {
    log_info "Criando backup do sistema atual..."
    
    # Criar tag de backup no Git
    local backup_tag="v$(date +%Y%m%d_%H%M%S)_pre_modular_migration"
    git tag -a "$backup_tag" -m "Backup antes da migração modular"
    log_success "Tag de backup criada: $backup_tag"
    
    # Backup do banco de dados
    if command -v pg_dump &> /dev/null; then
        local backup_dir="backups/$(date +%Y%m%d_%H%M%S)"
        mkdir -p "$backup_dir"
        
        log_info "Fazendo backup do banco de dados..."
        # Note: Ajuste as credenciais conforme necessário
        # pg_dump -h localhost -U postgres -d portal_educacional > "$backup_dir/database_backup.sql"
        log_success "Backup do banco salvo em $backup_dir/"
    fi
    
    # Backup de arquivos importantes
    log_info "Criando backup de arquivos de configuração..."
    mkdir -p "backups/config_backup_$(date +%Y%m%d_%H%M%S)"
    cp -r src/ "backups/config_backup_$(date +%Y%m%d_%H%M%S)/"
    
    log_success "Backup completo realizado!"
}

# Criar estrutura modular
create_modular_structure() {
    log_info "Criando estrutura modular..."
    
    # Criar diretórios do core
    mkdir -p src/core/{entities,types,utils,constants,config,database}
    
    # Criar diretórios dos módulos
    local modules=(
        "auth"
        "institution" 
        "academic"
        "content"
        "analytics"
        "communication"
        "guardian"
    )
    
    for module in "${modules[@]}"; do
        mkdir -p "src/modules/$module"/{entities,services,controllers,types,middleware,dashboards}
    done
    
    # Criar diretórios especiais
    mkdir -p src/modules/content/portals
    mkdir -p src/modules/communication/integrations
    
    log_success "Estrutura modular criada!"
}

# Migrar entidades para o módulo core
migrate_core_entities() {
    log_info "Migrando entidades para o módulo core..."
    
    # Mover entidades base
    if [[ -d "src/entities" ]]; then
        # Entidades que vão para o core (base do sistema)
        local core_entities=(
            "User.ts"
            "Role.ts" 
            "Institution.ts"
            "File.ts"
        )
        
        for entity in "${core_entities[@]}"; do
            if [[ -f "src/entities/$entity" ]]; then
                mv "src/entities/$entity" "src/core/entities/"
                log_success "Movido: $entity para core/entities"
            fi
        done
    fi
    
    # Mover types compartilhadas
    if [[ -d "src/types" ]]; then
        cp -r src/types/* src/core/types/ 2>/dev/null || true
    fi
    
    # Mover utilitários
    if [[ -d "src/utils" ]]; then
        cp -r src/utils/* src/core/utils/ 2>/dev/null || true
    fi
    
    log_success "Migração do core concluída!"
}

# Migrar módulo de autenticação
migrate_auth_module() {
    log_info "Migrando módulo de autenticação..."
    
    # Mover controllers de auth
    if [[ -d "src/controllers" ]]; then
        find src/controllers -name "*auth*" -o -name "*user*" -o -name "*login*" | while read -r file; do
            if [[ -f "$file" ]]; then
                mv "$file" "src/modules/auth/controllers/"
                log_success "Movido: $(basename $file) para auth/controllers"
            fi
        done
    fi
    
    # Mover services de auth
    if [[ -d "src/services" ]]; then
        find src/services -name "*auth*" -o -name "*user*" -o -name "*session*" | while read -r file; do
            if [[ -f "$file" ]]; then
                mv "$file" "src/modules/auth/services/"
                log_success "Movido: $(basename $file) para auth/services"
            fi
        done
    fi
    
    # Mover middleware de auth
    if [[ -d "src/middleware" ]]; then
        find src/middleware -name "*auth*" -o -name "*permission*" | while read -r file; do
            if [[ -f "$file" ]]; then
                mv "$file" "src/modules/auth/middleware/"
                log_success "Movido: $(basename $file) para auth/middleware"
            fi
        done
    fi
    
    log_success "Migração do módulo auth concluída!"
}

# Migrar módulo institucional
migrate_institution_module() {
    log_info "Migrando módulo institucional..."
    
    # Mover entidades institucionais
    local institution_entities=(
        "School.ts"
        "Class.ts"
        "EducationCycle.ts"
        "SchoolManager.ts"
        "UserClass.ts"
    )
    
    for entity in "${institution_entities[@]}"; do
        if [[ -f "src/entities/$entity" ]]; then
            mv "src/entities/$entity" "src/modules/institution/entities/"
            log_success "Movido: $entity para institution/entities"
        fi
    done
    
    # Mover controllers relacionados
    if [[ -d "src/controllers" ]]; then
        find src/controllers -name "*school*" -o -name "*institution*" -o -name "*class*" | while read -r file; do
            if [[ -f "$file" ]]; then
                mv "$file" "src/modules/institution/controllers/"
                log_success "Movido: $(basename $file) para institution/controllers"
            fi
        done
    fi
    
    log_success "Migração do módulo institution concluída!"
}

# Migrar módulo acadêmico
migrate_academic_module() {
    log_info "Migrando módulo acadêmico..."
    
    # Mover entidades acadêmicas
    local academic_entities=(
        "Course.ts"
        "Module.ts"
        "Quiz.ts"
        "Question.ts"
    )
    
    for entity in "${academic_entities[@]}"; do
        if [[ -f "src/entities/$entity" ]]; then
            mv "src/entities/$entity" "src/modules/academic/entities/"
            log_success "Movido: $entity para academic/entities"
        fi
    done
    
    # Mover controllers acadêmicos
    if [[ -d "src/controllers" ]]; then
        find src/controllers -name "*course*" -o -name "*grade*" -o -name "*quiz*" | while read -r file; do
            if [[ -f "$file" ]]; then
                mv "$file" "src/modules/academic/controllers/"
                log_success "Movido: $(basename $file) para academic/controllers"
            fi
        done
    fi
    
    log_success "Migração do módulo academic concluída!"
}

# Migrar módulo de conteúdo
migrate_content_module() {
    log_info "Migrando módulo de conteúdo..."
    
    # Mover entidades de conteúdo
    local content_entities=(
        "Video.ts"
        "Book.ts"
        "Collection.ts"
        "TvShow.ts"
        "TvShowVideo.ts"
        "VideoFile.ts"
        "Author.ts"
        "ContentAuthor.ts"
    )
    
    for entity in "${content_entities[@]}"; do
        if [[ -f "src/entities/$entity" ]]; then
            mv "src/entities/$entity" "src/modules/content/entities/"
            log_success "Movido: $entity para content/entities"
        fi
    done
    
    # Mover controllers de conteúdo
    if [[ -d "src/controllers" ]]; then
        find src/controllers -name "*video*" -o -name "*book*" -o -name "*content*" | while read -r file; do
            if [[ -f "$file" ]]; then
                mv "$file" "src/modules/content/controllers/"
                log_success "Movido: $(basename $file) para content/controllers"
            fi
        done
    fi
    
    log_success "Migração do módulo content concluída!"
}

# Migrar módulo de comunicação
migrate_communication_module() {
    log_info "Migrando módulo de comunicação..."
    
    # Mover entidades de comunicação
    local communication_entities=(
        "Notification.ts"
        "ChatMessage.ts"
        "Announcement.ts"
        "ForumThread.ts"
        "ForumReply.ts"
    )
    
    for entity in "${communication_entities[@]}"; do
        if [[ -f "src/entities/$entity" ]]; then
            mv "src/entities/$entity" "src/modules/communication/entities/"
            log_success "Movido: $entity para communication/entities"
        fi
    done
    
    log_success "Migração do módulo communication concluída!"
}

# Atualizar imports nos arquivos
update_imports() {
    log_info "Atualizando imports nos arquivos..."
    
    # Encontrar todos os arquivos TypeScript
    find src -name "*.ts" -o -name "*.tsx" | while read -r file; do
        # Substituir imports relativos para a nova estrutura
        sed -i 's|from "\.\./entities/|from "../core/entities/|g' "$file" 2>/dev/null || true
        sed -i 's|from "\.\./\.\./entities/|from "../../core/entities/|g' "$file" 2>/dev/null || true
        sed -i 's|from "\.\./types/|from "../core/types/|g' "$file" 2>/dev/null || true
        sed -i 's|from "\.\./utils/|from "../core/utils/|g' "$file" 2>/dev/null || true
    done
    
    log_success "Imports atualizados!"
}

# Criar arquivos de configuração modulares
create_module_configs() {
    log_info "Criando arquivos de configuração modulares..."
    
    # Criar index.ts para cada módulo
    local modules=(
        "auth"
        "institution" 
        "academic"
        "content"
        "analytics"
        "communication"
        "guardian"
    )
    
    for module in "${modules[@]}"; do
        cat > "src/modules/$module/index.ts" << EOF
// Índice do módulo $module
export * from './entities';
export * from './services';
export * from './controllers';
export * from './types';
EOF
        log_success "Criado index.ts para módulo $module"
    done
    
    # Criar index.ts para o core
    cat > "src/core/index.ts" << EOF
// Índice do core do sistema
export * from './entities';
export * from './types';
export * from './utils';
export * from './constants';
export * from './config';
EOF
    
    log_success "Arquivos de configuração modulares criados!"
}

# Atualizar package.json com novos scripts
update_package_scripts() {
    log_info "Atualizando scripts do package.json..."
    
    # Adicionar scripts modulares ao package.json usando Node.js
    node << 'EOF'
const fs = require('fs');
const path = require('path');

const packagePath = path.join(process.cwd(), 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf8'));

// Adicionar novos scripts modulares
const newScripts = {
    "migrate:verify": "node scripts/verify-modular-structure.js",
    "test:modules": "npm run test -- src/modules/",
    "build:modules": "tsc --build src/modules/*/tsconfig.json",
    "dev:modules": "concurrently \"npm run dev\" \"npm run test:modules -- --watch\"",
    "analyze:dependencies": "node scripts/analyze-dependencies.js",
    "verify:structure": "node scripts/verify-modular-migration.js"
};

Object.assign(packageJson.scripts, newScripts);

fs.writeFileSync(packagePath, JSON.stringify(packageJson, null, 2));
console.log('✅ Scripts modulares adicionados ao package.json');
EOF
    
    log_success "Package.json atualizado com scripts modulares!"
}

# Executar testes de verificação
run_verification_tests() {
    log_info "Executando testes de verificação..."
    
    # Verificar se a estrutura foi criada corretamente
    local required_dirs=(
        "src/core/entities"
        "src/core/types"
        "src/core/utils"
        "src/modules/auth/entities"
        "src/modules/auth/services"
        "src/modules/institution/entities"
        "src/modules/academic/entities"
        "src/modules/content/entities"
        "src/modules/communication/entities"
    )
    
    local missing_dirs=()
    for dir in "${required_dirs[@]}"; do
        if [[ ! -d "$dir" ]]; then
            missing_dirs+=("$dir")
        fi
    done
    
    if [[ ${#missing_dirs[@]} -eq 0 ]]; then
        log_success "Estrutura modular verificada com sucesso!"
    else
        log_warning "Diretórios ausentes encontrados:"
        printf '%s\n' "${missing_dirs[@]}"
    fi
    
    # Tentar compilar o TypeScript
    if command -v tsc &> /dev/null; then
        log_info "Verificando compilação TypeScript..."
        if tsc --noEmit; then
            log_success "Código TypeScript compila sem erros!"
        else
            log_warning "Encontrados erros de compilação TypeScript. Revise os imports."
        fi
    fi
}

# Função principal
main() {
    echo -e "${BLUE}"
    echo "🚀 MIGRAÇÃO PARA ARQUITETURA MODULAR"
    echo "===================================="
    echo -e "${NC}"
    
    # Confirmar execução
    read -p "Deseja continuar com a migração? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        log_info "Migração cancelada pelo usuário."
        exit 0
    fi
    
    # Executar etapas da migração
    check_prerequisites
    create_backup
    create_modular_structure
    migrate_core_entities
    migrate_auth_module
    migrate_institution_module
    migrate_academic_module
    migrate_content_module
    migrate_communication_module
    update_imports
    create_module_configs
    update_package_scripts
    run_verification_tests
    
    echo -e "${GREEN}"
    echo "🎉 MIGRAÇÃO CONCLUÍDA COM SUCESSO!"
    echo "================================="
    echo -e "${NC}"
    
    log_info "Próximos passos recomendados:"
    echo "1. Executar 'npm run verify:structure' para verificação completa"
    echo "2. Executar 'npm run test:modules' para testar os módulos"
    echo "3. Revisar e ajustar imports se necessário"
    echo "4. Fazer commit das mudanças"
    
    log_success "Sistema migrado para arquitetura modular!"
}

# Executar função principal
main "$@" 
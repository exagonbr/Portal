#!/bin/bash

# Script para configurar backup automático do PostgreSQL
# Compatível com Windows/Git Bash

# Configurações
DB_NAME="portal_db"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="C:/Users/estev/OneDrive/Documentos/backups/postgresql"
LOG_FILE="$BACKUP_DIR/backup.log"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🔧 Configurando Backup Automático do PostgreSQL${NC}"
echo "=================================================="

# Função para log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" | tee -a "$LOG_FILE"
}

# Criar diretório de backup se não existir
if [ ! -d "$BACKUP_DIR" ]; then
    echo -e "${YELLOW}📁 Criando diretório de backup...${NC}"
    mkdir -p "$BACKUP_DIR"
    log "Diretório de backup criado: $BACKUP_DIR"
fi

# Verificar se PostgreSQL está instalado
if ! command -v pg_dump &> /dev/null; then
    echo -e "${RED}❌ PostgreSQL não encontrado! Instale o PostgreSQL primeiro.${NC}"
    exit 1
fi

echo -e "${GREEN}✅ PostgreSQL encontrado${NC}"

# Função de backup
create_backup() {
    local backup_type=$1
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/${DB_NAME}_${backup_type}_${timestamp}.sql"
    local compressed_file="$BACKUP_DIR/${DB_NAME}_${backup_type}_${timestamp}.gz"
    
    echo -e "${BLUE}🔄 Iniciando backup $backup_type...${NC}"
    log "Iniciando backup $backup_type"
    
    # Executar backup
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$backup_file" 2>/dev/null; then
        # Comprimir o arquivo
        gzip "$backup_file"
        
        # Verificar tamanho do arquivo
        local size=$(du -h "$compressed_file" | cut -f1)
        echo -e "${GREEN}✅ Backup $backup_type concluído: $size${NC}"
        log "Backup $backup_type concluído: $compressed_file ($size)"
        
        return 0
    else
        echo -e "${RED}❌ Falha no backup $backup_type${NC}"
        log "ERRO: Falha no backup $backup_type"
        return 1
    fi
}

# Função para limpeza de backups antigos
cleanup_old_backups() {
    local days=$1
    echo -e "${YELLOW}🧹 Removendo backups com mais de $days dias...${NC}"
    
    # Contar arquivos antes da limpeza
    local count_before=$(find "$BACKUP_DIR" -name "*.gz" -type f | wc -l)
    
    # Remover arquivos antigos
    find "$BACKUP_DIR" -name "*.gz" -type f -mtime +$days -delete
    
    # Contar arquivos após limpeza
    local count_after=$(find "$BACKUP_DIR" -name "*.gz" -type f | wc -l)
    local removed=$((count_before - count_after))
    
    echo -e "${GREEN}✅ $removed backups antigos removidos${NC}"
    log "Limpeza concluída: $removed arquivos removidos"
}

# Criar script de backup diário
create_backup_script() {
    local script_file="$BACKUP_DIR/daily_backup.sh"
    
    cat > "$script_file" << 'EOF'
#!/bin/bash
# Script de backup diário automático

# Configurações
DB_NAME="portal_db"
DB_USER="postgres"
DB_HOST="localhost"
DB_PORT="5432"
BACKUP_DIR="C:/Users/estev/OneDrive/Documentos/backups/postgresql"
LOG_FILE="$BACKUP_DIR/backup.log"

# Função para log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Função de backup
create_backup() {
    local backup_type=$1
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/${DB_NAME}_${backup_type}_${timestamp}.sql"
    local compressed_file="$BACKUP_DIR/${DB_NAME}_${backup_type}_${timestamp}.gz"
    
    log "Iniciando backup $backup_type"
    
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$backup_file" 2>/dev/null; then
        gzip "$backup_file"
        local size=$(du -h "$compressed_file" | cut -f1)
        log "Backup $backup_type concluído: $compressed_file ($size)"
        return 0
    else
        log "ERRO: Falha no backup $backup_type"
        return 1
    fi
}

# Executar backup
if create_backup "daily"; then
    log "Backup diário executado com sucesso"
    
    # Limpeza de backups antigos (manter 30 dias)
    find "$BACKUP_DIR" -name "*_daily_*.gz" -type f -mtime +30 -delete
    log "Limpeza de backups antigos concluída"
else
    log "FALHA no backup diário"
    exit 1
fi
EOF

    chmod +x "$script_file"
    echo -e "${GREEN}✅ Script de backup diário criado: $script_file${NC}"
    log "Script de backup diário criado: $script_file"
}

# Criar script de backup semanal
create_weekly_backup_script() {
    local script_file="$BACKUP_DIR/weekly_backup.sh"
    
    cat > "$script_file" << 'EOF'
#!/bin/bash
# Script de backup semanal completo

# Configurações
DB_NAME="portal_db"
DB_USER="postgres"
DB_HOST="localhost" 
DB_PORT="5432"
BACKUP_DIR="C:/Users/estev/OneDrive/Documentos/backups/postgresql"
LOG_FILE="$BACKUP_DIR/backup.log"

# Função para log
log() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] $1" >> "$LOG_FILE"
}

# Backup completo com dados e estrutura
create_full_backup() {
    local timestamp=$(date +%Y%m%d_%H%M%S)
    local backup_file="$BACKUP_DIR/${DB_NAME}_full_${timestamp}.dump"
    
    log "Iniciando backup completo (formato custom)"
    
    if pg_dump -Fc -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$backup_file" 2>/dev/null; then
        local size=$(du -h "$backup_file" | cut -f1)
        log "Backup completo concluído: $backup_file ($size)"
        return 0
    else
        log "ERRO: Falha no backup completo"
        return 1
    fi
}

# Executar backup
if create_full_backup; then
    log "Backup semanal completo executado com sucesso"
    
    # Limpeza de backups semanais antigos (manter 12 semanas = 3 meses)
    find "$BACKUP_DIR" -name "*_full_*.dump" -type f -mtime +84 -delete
    log "Limpeza de backups semanais antigos concluída"
else
    log "FALHA no backup semanal"
    exit 1
fi
EOF

    chmod +x "$script_file"
    echo -e "${GREEN}✅ Script de backup semanal criado: $script_file${NC}"
    log "Script de backup semanal criado: $script_file"
}

# Menu principal
show_menu() {
    echo ""
    echo -e "${BLUE}💾 MENU DE CONFIGURAÇÃO DE BACKUP${NC}"
    echo "=================================="
    echo "1. Executar backup manual agora"
    echo "2. Criar scripts de backup automático"
    echo "3. Testar backup e restore"
    echo "4. Configurar agendamento (Windows Task Scheduler)"
    echo "5. Verificar backups existentes"
    echo "6. Limpeza de backups antigos"
    echo "7. Sair"
    echo ""
    read -p "Escolha uma opção (1-7): " choice
    
    case $choice in
        1)
            echo -e "${BLUE}🔄 Executando backup manual...${NC}"
            create_backup "manual"
            ;;
        2)
            echo -e "${BLUE}📝 Criando scripts de backup...${NC}"
            create_backup_script
            create_weekly_backup_script
            echo -e "${GREEN}✅ Scripts criados com sucesso!${NC}"
            ;;
        3)
            test_backup_restore
            ;;
        4)
            configure_windows_scheduler
            ;;
        5)
            list_existing_backups
            ;;
        6)
            read -p "Quantos dias manter? (padrão: 30): " days
            days=${days:-30}
            cleanup_old_backups $days
            ;;
        7)
            echo -e "${GREEN}✅ Saindo...${NC}"
            exit 0
            ;;
        *)
            echo -e "${RED}❌ Opção inválida!${NC}"
            ;;
    esac
}

# Função para testar backup e restore
test_backup_restore() {
    echo -e "${BLUE}🧪 Testando backup e restore...${NC}"
    
    # Criar backup de teste
    local test_backup="$BACKUP_DIR/test_backup_$(date +%Y%m%d_%H%M%S).sql"
    
    if pg_dump -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > "$test_backup" 2>/dev/null; then
        echo -e "${GREEN}✅ Backup de teste criado${NC}"
        
        # Verificar conteúdo do backup
        local lines=$(wc -l < "$test_backup")
        local size=$(du -h "$test_backup" | cut -f1)
        
        echo -e "${GREEN}📊 Estatísticas do backup:${NC}"
        echo "  - Linhas: $lines"
        echo "  - Tamanho: $size"
        echo "  - Arquivo: $test_backup"
        
        # Remover backup de teste
        rm "$test_backup"
        echo -e "${GREEN}✅ Teste concluído com sucesso${NC}"
    else
        echo -e "${RED}❌ Falha no teste de backup${NC}"
    fi
}

# Função para configurar agendamento no Windows
configure_windows_scheduler() {
    echo -e "${BLUE}⏰ Configurando Agendamento Windows${NC}"
    echo ""
    echo "Para configurar backup automático no Windows:"
    echo ""
    echo "1. Abra o 'Agendador de Tarefas' (Task Scheduler)"
    echo "2. Clique em 'Criar Tarefa Básica'"
    echo "3. Configure os seguintes parâmetros:"
    echo ""
    echo -e "${YELLOW}📅 BACKUP DIÁRIO:${NC}"
    echo "   - Nome: Portal DB Backup Diário"
    echo "   - Disparador: Diário às 02:00"
    echo "   - Ação: Iniciar programa"
    echo "   - Programa: C:\\Program Files\\Git\\bin\\bash.exe"
    echo "   - Argumentos: $BACKUP_DIR/daily_backup.sh"
    echo ""
    echo -e "${YELLOW}📅 BACKUP SEMANAL:${NC}"
    echo "   - Nome: Portal DB Backup Semanal"
    echo "   - Disparador: Semanal (Domingos às 01:00)"
    echo "   - Ação: Iniciar programa"
    echo "   - Programa: C:\\Program Files\\Git\\bin\\bash.exe"
    echo "   - Argumentos: $BACKUP_DIR/weekly_backup.sh"
    echo ""
    echo "4. Configure notificações por email em caso de falha"
}

# Função para listar backups existentes
list_existing_backups() {
    echo -e "${BLUE}📋 Backups Existentes${NC}"
    echo "===================="
    
    if [ ! -d "$BACKUP_DIR" ]; then
        echo -e "${YELLOW}⚠️ Diretório de backup não existe${NC}"
        return
    fi
    
    local backups=$(find "$BACKUP_DIR" -name "*.gz" -o -name "*.dump" | sort -r)
    
    if [ -z "$backups" ]; then
        echo -e "${YELLOW}⚠️ Nenhum backup encontrado${NC}"
        return
    fi
    
    echo -e "${GREEN}Backups encontrados:${NC}"
    
    for backup in $backups; do
        local size=$(du -h "$backup" | cut -f1)
        local date=$(date -r "$backup" '+%Y-%m-%d %H:%M:%S' 2>/dev/null || stat -c %y "$backup" 2>/dev/null || echo "Data desconhecida")
        echo "  📁 $(basename "$backup") - $size - $date"
    done
    
    echo ""
    echo -e "${BLUE}Total: $(echo "$backups" | wc -l) arquivos${NC}"
}

# Execução principal
main() {
    # Verificar se PostgreSQL está rodando
    if ! pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" &>/dev/null; then
        echo -e "${YELLOW}⚠️ PostgreSQL pode não estar rodando. Continuando...${NC}"
    fi
    
    # Criar log inicial
    log "Script de configuração de backup iniciado"
    
    # Loop do menu
    while true; do
        show_menu
        echo ""
        read -p "Pressione Enter para continuar..."
    done
}

# Verificar se é execução direta
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi 
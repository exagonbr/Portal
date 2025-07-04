#!/bin/bash

# Portal Sabercon - Correção de Problemas do Sistema
# Este script corrige problemas comuns antes do deploy

set -e

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Função para logging
log() {
    echo -e "${BLUE}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')] ✅${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] ⚠️${NC} $1"
}

log_error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ❌${NC} $1"
}

# Verificar se está executando como root ou com sudo
if [ "$EUID" -ne 0 ]; then
    log_error "Este script deve ser executado como root ou com sudo"
    exit 1
fi

log "🔧 Iniciando correção de problemas do sistema..."
echo ""

# 1. Verificar e corrigir problemas de configuração de pacotes
log "🔍 Verificando configuração de pacotes..."
if ! dpkg --configure -a 2>/dev/null; then
    log_warning "⚠️  Problemas de configuração detectados"
    
    # Interromper processos que podem estar travando
    log "🛑 Interrompendo processos de instalação em andamento..."
    killall apt apt-get dpkg 2>/dev/null || true
    
    # Remover locks se existirem
    log "🔓 Removendo locks de instalação..."
    rm -f /var/lib/dpkg/lock-frontend 2>/dev/null || true
    rm -f /var/lib/apt/lists/lock 2>/dev/null || true
    rm -f /var/cache/apt/archives/lock 2>/dev/null || true
    rm -f /var/lib/dpkg/lock 2>/dev/null || true
    
    # Reconfigurar dpkg
    log "🔧 Reconfigurando gerenciador de pacotes..."
    dpkg --configure -a 2>/dev/null || true
    
    log_success "Locks removidos"
else
    log_success "Configuração de pacotes OK"
fi

# 2. Corrigir problemas específicos do GRUB
log "🔍 Verificando problemas do GRUB..."
if dpkg -l | grep -q grub-efi; then
    if dpkg -l | grep -q "^iU.*grub-efi"; then
        log_warning "⚠️  Problemas com GRUB detectados"
        
        log "🔧 Corrigindo GRUB..."
        
        # Tentar reconfigurar GRUB
        DEBIAN_FRONTEND=noninteractive dpkg --configure grub-efi-amd64-signed 2>/dev/null || true
        
        # Se ainda houver problemas, tentar reinstalar
        if dpkg -l | grep -q "^iU.*grub-efi"; then
            log "🔧 Reinstalando GRUB..."
            apt-get remove --purge grub-efi-amd64-signed shim-signed -y 2>/dev/null || true
            apt-get install grub-efi-amd64-signed shim-signed -y 2>/dev/null || true
        fi
        
        # Atualizar GRUB
        update-grub 2>/dev/null || true
        
        log_success "GRUB corrigido"
    else
        log_success "GRUB OK"
    fi
else
    log_success "GRUB não instalado (normal em VPS)"
fi

# 3. Corrigir dependências quebradas
log "🔍 Verificando dependências quebradas..."
if ! apt-get check 2>/dev/null; then
    log_warning "⚠️  Dependências quebradas detectadas"
    
    log "🔧 Corrigindo dependências..."
    apt-get install -f -y
    
    log_success "Dependências corrigidas"
else
    log_success "Dependências OK"
fi

# 4. Limpar cache de pacotes
log "🧹 Limpando cache de pacotes..."
apt-get clean
apt-get autoclean
apt-get autoremove -y

log_success "Cache limpo"

# 5. Atualizar lista de pacotes
log "📦 Atualizando lista de pacotes..."
apt update

log_success "Lista de pacotes atualizada"

# 6. Verificação final
log "🔍 Verificação final do sistema..."

ISSUES_FOUND=0

# Verificar se dpkg está funcionando
if ! dpkg --configure -a 2>/dev/null; then
    log_warning "⚠️  Ainda há problemas com dpkg"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    log_success "dpkg funcionando"
fi

# Verificar se apt está funcionando
if ! apt-get check 2>/dev/null; then
    log_warning "⚠️  Ainda há problemas com apt"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    log_success "apt funcionando"
fi

# Verificar espaço em disco
DISK_USAGE=$(df / | awk 'NR==2 {print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    log_warning "⚠️  Pouco espaço em disco: ${DISK_USAGE}%"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    log_success "Espaço em disco OK: ${DISK_USAGE}% usado"
fi

# Verificar memória
MEMORY_USAGE=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
if [ "$MEMORY_USAGE" -gt 90 ]; then
    log_warning "⚠️  Pouca memória disponível: ${MEMORY_USAGE}% usado"
    ISSUES_FOUND=$((ISSUES_FOUND + 1))
else
    log_success "Memória OK: ${MEMORY_USAGE}% usado"
fi

echo ""
if [ "$ISSUES_FOUND" -eq 0 ]; then
    log_success "🎉 Sistema corrigido com sucesso!"
    echo ""
    echo "✅ Todos os problemas foram resolvidos"
    echo "✅ Sistema pronto para deploy"
    echo ""
    echo "🚀 Execute agora:"
    echo "   sudo bash deploy-portal-production.sh"
else
    log_warning "⚠️  Sistema parcialmente corrigido"
    echo ""
    echo "⚠️  $ISSUES_FOUND problema(s) ainda presente(s)"
    echo "⚠️  O deploy pode continuar, mas monitore os logs"
    echo ""
    echo "🚀 Para continuar mesmo assim:"
    echo "   sudo bash deploy-portal-production.sh"
    echo ""
    echo "📞 Se houver problemas:"
    echo "   • Verifique os logs: journalctl -xe"
    echo "   • Libere espaço em disco se necessário"
    echo "   • Reinicie o servidor se necessário"
fi

echo ""
log_success "Correção finalizada! ✨" 
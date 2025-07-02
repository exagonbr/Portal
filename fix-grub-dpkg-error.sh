#!/bin/bash

# Script para corrigir erro de GRUB/dpkg em servidores VPS
# Autor: Portal Sabercon Deploy
# Data: $(date)

set -e

echo "🔧 Iniciando correção de erro GRUB/dpkg..."

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para log
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

warn() {
    echo -e "${YELLOW}[$(date +'%Y-%m-%d %H:%M:%S')] AVISO:${NC} $1"
}

error() {
    echo -e "${RED}[$(date +'%Y-%m-%d %H:%M:%S')] ERRO:${NC} $1"
}

# Verificar se é root
if [[ $EUID -ne 0 ]]; then
   error "Este script deve ser executado como root (sudo)"
   exit 1
fi

log "Verificando sistema..."

# 1. Parar todos os processos apt/dpkg
log "Parando processos apt/dpkg..."
killall apt apt-get dpkg 2>/dev/null || true
sleep 2

# 2. Remover locks
log "Removendo locks do sistema..."
rm -f /var/lib/dpkg/lock-frontend 2>/dev/null || true
rm -f /var/lib/apt/lists/lock 2>/dev/null || true
rm -f /var/cache/apt/archives/lock 2>/dev/null || true
rm -f /var/lib/dpkg/lock 2>/dev/null || true

# 3. Verificar se há processos dpkg travados
if pgrep -f dpkg > /dev/null; then
    warn "Processos dpkg ainda em execução, forçando término..."
    pkill -9 -f dpkg 2>/dev/null || true
    sleep 3
fi

# 4. Tentar configurar pacotes pendentes
log "Tentando configurar pacotes pendentes..."
if ! dpkg --configure -a 2>/dev/null; then
    warn "Falha na configuração automática, removendo pacotes problemáticos..."
    
    # 5. Remover pacotes GRUB problemáticos (seguro em VPS)
    log "Removendo pacotes GRUB problemáticos..."
    apt-get remove --purge grub-efi-amd64-signed shim-signed -y 2>/dev/null || true
    apt-get remove --purge grub-efi-amd64 grub-efi-amd64-bin -y 2>/dev/null || true
    apt-get remove --purge grub-common grub2-common -y 2>/dev/null || true
    
    # Tentar configurar novamente
    log "Tentando configurar pacotes após remoção..."
    dpkg --configure -a 2>/dev/null || true
fi

# 6. Corrigir dependências quebradas
log "Corrigindo dependências quebradas..."
apt-get install -f -y 2>/dev/null || true

# 7. Limpar cache do apt
log "Limpando cache do apt..."
apt-get clean
apt-get autoclean
apt-get autoremove -y 2>/dev/null || true

# 8. Atualizar lista de pacotes
log "Atualizando lista de pacotes..."
if ! apt update 2>/dev/null; then
    warn "Falha na atualização, tentando corrigir sources.list..."
    
    # Backup do sources.list
    cp /etc/apt/sources.list /etc/apt/sources.list.backup.$(date +%Y%m%d_%H%M%S)
    
    # Detectar versão do Ubuntu
    UBUNTU_VERSION=$(lsb_release -rs 2>/dev/null || echo "20.04")
    UBUNTU_CODENAME=$(lsb_release -cs 2>/dev/null || echo "focal")
    
    # Recriar sources.list básico
    cat > /etc/apt/sources.list << EOF
# Ubuntu $UBUNTU_VERSION ($UBUNTU_CODENAME) - Gerado automaticamente
deb http://archive.ubuntu.com/ubuntu/ $UBUNTU_CODENAME main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu/ $UBUNTU_CODENAME-updates main restricted universe multiverse
deb http://archive.ubuntu.com/ubuntu/ $UBUNTU_CODENAME-backports main restricted universe multiverse
deb http://security.ubuntu.com/ubuntu/ $UBUNTU_CODENAME-security main restricted universe multiverse
EOF
    
    log "Sources.list recriado, tentando atualizar novamente..."
    apt update
fi

# 9. Verificar se o sistema está funcionando
log "Verificando se o sistema está funcionando..."
if apt list --installed > /dev/null 2>&1; then
    log "✅ Sistema APT funcionando corretamente!"
else
    error "❌ Sistema APT ainda com problemas"
    exit 1
fi

# 10. Verificar espaço em disco
log "Verificando espaço em disco..."
DISK_USAGE=$(df / | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 90 ]; then
    warn "Espaço em disco baixo (${DISK_USAGE}%), limpando..."
    apt-get autoremove -y
    apt-get autoclean
    
    # Limpar logs antigos
    find /var/log -type f -name "*.log" -mtime +7 -delete 2>/dev/null || true
    find /var/log -type f -name "*.gz" -mtime +7 -delete 2>/dev/null || true
    
    log "Limpeza concluída"
fi

# 11. Verificar memória
log "Verificando memória disponível..."
MEMORY_AVAILABLE=$(free -m | awk 'NR==2{printf "%.0f", $7}')
if [ "$MEMORY_AVAILABLE" -lt 200 ]; then
    warn "Memória baixa (${MEMORY_AVAILABLE}MB), limpando cache..."
    sync && echo 3 > /proc/sys/vm/drop_caches
    log "Cache limpo"
fi

# 12. Teste final
log "Executando teste final do sistema..."
if apt-get update && apt-get install -y curl wget; then
    log "✅ Sistema corrigido com sucesso!"
    log "✅ Pronto para executar o deploy:"
    log "   sudo bash deploy-portal-production.sh"
else
    error "❌ Ainda há problemas no sistema"
    error "Verifique os logs acima e tente executar manualmente:"
    error "1. sudo dpkg --configure -a"
    error "2. sudo apt-get install -f"
    error "3. sudo apt update"
    exit 1
fi

echo ""
log "🎉 Correção concluída com sucesso!"
log "Agora você pode executar o deploy normalmente:"
echo -e "${GREEN}sudo bash deploy-portal-production.sh${NC}"
echo "" 
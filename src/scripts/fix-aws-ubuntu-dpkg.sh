#!/bin/bash

# Script para corrigir erro de GRUB/dpkg em servidores AWS com Ubuntu
# Autor: Portal Sabercon Deploy
# Data: $(date)

set -e

echo "🔧 Iniciando correção de erro GRUB/dpkg para AWS Ubuntu..."

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

log "Verificando ambiente AWS Ubuntu..."

# 1. Matar processos APT/DPKG travados
log "Parando processos apt/dpkg..."
killall -9 apt apt-get dpkg 2>/dev/null || true
sleep 2

# 2. Remover locks com força
log "Removendo locks do sistema..."
rm -f /var/lib/dpkg/lock*
rm -f /var/lib/apt/lists/lock*
rm -f /var/cache/apt/archives/lock*
rm -f /var/lib/apt/daily_lock

# 3. Verificar se há processos dpkg travados
if pgrep -f dpkg > /dev/null; then
    warn "Processos dpkg ainda em execução, forçando término..."
    pkill -9 -f dpkg 2>/dev/null || true
    sleep 3
fi

# 4. Remover pacotes GRUB problemáticos (específico para AWS)
log "Removendo pacotes GRUB problemáticos (AWS)..."
apt-get remove --purge -y grub-efi-amd64-signed shim-signed 2>/dev/null || true
apt-get remove --purge -y grub-efi-amd64 grub-efi-amd64-bin 2>/dev/null || true
apt-get remove --purge -y grub-common grub2-common 2>/dev/null || true
apt-get remove --purge -y grub-pc grub-pc-bin 2>/dev/null || true
apt-get remove --purge -y grub* shim* 2>/dev/null || true

# 5. Reparar arquivos de status do dpkg
log "Reparando arquivos de status do dpkg..."
if [ -f /var/lib/dpkg/status ]; then
    cp /var/lib/dpkg/status /var/lib/dpkg/status.bak-$(date +%Y%m%d-%H%M%S)
    
    # Remover entradas quebradas do GRUB
    grep -v "grub-efi\|shim-signed" /var/lib/dpkg/status > /tmp/dpkg-status-clean
    mv /tmp/dpkg-status-clean /var/lib/dpkg/status
fi

# 6. Corrigir dependências quebradas
log "Corrigindo dependências quebradas..."
apt-get install -f -y 2>/dev/null || true

# 7. Reconstruir cache do apt
log "Reconstruindo cache do apt..."
apt-get clean
apt-get autoclean
rm -rf /var/lib/apt/lists/*
apt-get update --fix-missing

# 8. Configurar pacotes pendentes
log "Configurando pacotes pendentes..."
dpkg --configure -a || true

# 9. Verificar se o sistema está funcionando
log "Verificando se o sistema está funcionando..."
if apt-get update; then
    log "✅ Sistema APT funcionando corretamente!"
else
    warn "⚠️ Ainda há problemas no APT, tentando solução mais agressiva..."
    
    # Solução mais agressiva - reinstalar o APT
    apt-get install --reinstall apt
    
    # Verificar novamente
    if apt-get update; then
        log "✅ Sistema APT recuperado após reinstalação!"
    else
        error "❌ Problemas persistentes no sistema APT"
    fi
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

# 11. Verificar e corrigir problemas específicos da AWS
log "Verificando problemas específicos da AWS..."

# Verificar se estamos em uma instância EC2
if curl -s http://169.254.169.254/latest/meta-data/ > /dev/null; then
    log "✅ Detectada instância EC2 AWS"
    
    # Verificar e corrigir problemas de cloud-init
    if dpkg -l | grep -q cloud-init; then
        log "Verificando cloud-init..."
        if ! systemctl is-active --quiet cloud-init; then
            warn "cloud-init não está ativo, tentando corrigir..."
            apt-get install --reinstall cloud-init -y
            systemctl restart cloud-init || true
        fi
    fi
else
    warn "⚠️ Não foi possível confirmar se estamos em uma instância EC2"
fi

echo ""
log "🎉 Correção concluída com sucesso!"
log "Agora você pode executar o deploy normalmente:"
echo -e "${GREEN}sudo bash deploy-aws-portal.sh${NC}"
echo "" 
#!/bin/bash

# Script para corrigir erro específico de shim-signed em AWS Ubuntu
# Autor: Portal Sabercon Deploy
# Data: $(date)

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

log "Iniciando correção do erro de shim-signed..."

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

# 3. Remover pacotes problemáticos
log "Removendo pacotes problemáticos..."
apt-get remove --purge -y shim-signed grub-efi-amd64-signed grub-efi-amd64 grub-efi-amd64-bin 2>/dev/null || true

# 4. Reparar arquivos de status do dpkg
log "Reparando arquivos de status do dpkg..."
if [ -f /var/lib/dpkg/status ]; then
    cp /var/lib/dpkg/status /var/lib/dpkg/status.bak-$(date +%Y%m%d-%H%M%S)
    
    # Remover entradas quebradas
    grep -v "shim-signed\|grub-efi-amd64-signed" /var/lib/dpkg/status > /tmp/dpkg-status-clean
    mv /tmp/dpkg-status-clean /var/lib/dpkg/status
fi

# 5. Corrigir dependências quebradas
log "Corrigindo dependências quebradas..."
apt-get install -f -y 2>/dev/null || true
dpkg --configure -a 2>/dev/null || true

# 6. Reconstruir cache do apt
log "Reconstruindo cache do apt..."
apt-get clean
apt-get autoclean
rm -rf /var/lib/apt/lists/*
apt-get update --fix-missing

# 7. Verificar se o problema foi resolvido
log "Verificando se o problema foi resolvido..."
if apt-get update && apt-get install -y curl; then
    log "✅ Problema resolvido com sucesso!"
else
    warn "⚠️ Ainda há problemas no sistema. Tentando solução mais agressiva..."
    
    # Solução mais agressiva - editar diretamente os arquivos de status
    log "Aplicando correção direta nos arquivos de status..."
    
    # Remover todos os pacotes grub e shim do status
    sed -i '/Package: grub/,/^$/d' /var/lib/dpkg/status 2>/dev/null || true
    sed -i '/Package: shim/,/^$/d' /var/lib/dpkg/status 2>/dev/null || true
    
    # Tentar novamente
    apt-get update
    apt-get install -f -y
    
    if apt-get update; then
        log "✅ Problema resolvido com sucesso após correção agressiva!"
    else
        error "❌ Não foi possível resolver o problema automaticamente"
        error "Execute o script completo: sudo bash fix-aws-ubuntu-dpkg.sh"
    fi
fi

echo ""
log "🎉 Correção concluída!"
log "Agora você pode executar o deploy normalmente:"
echo -e "${GREEN}sudo bash deploy-aws-portal.sh${NC}"
echo "" 
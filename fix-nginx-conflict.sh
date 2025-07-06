#!/bin/bash

# Script para resolver conflito de server_name no Nginx

echo "🔧 Resolvendo conflito de configuração do Nginx..."

# Cores
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

DOMAIN="portal.sabercon.com.br"

echo -e "\n${BLUE}1. Procurando configurações duplicadas...${NC}"

# Listar todos os arquivos que contêm o domínio
echo -e "\n${YELLOW}Arquivos que contêm '$DOMAIN':${NC}"
sudo grep -r "$DOMAIN" /etc/nginx/sites-enabled/ /etc/nginx/sites-available/ /etc/nginx/conf.d/ 2>/dev/null | grep -v "Binary file" | cut -d: -f1 | sort | uniq

# Contar quantas vezes aparece em sites-enabled
ENABLED_COUNT=$(sudo grep -r "server_name.*$DOMAIN" /etc/nginx/sites-enabled/ 2>/dev/null | grep -v "#" | wc -l)
echo -e "\n${YELLOW}Configurações ativas encontradas: $ENABLED_COUNT${NC}"

if [ $ENABLED_COUNT -gt 1 ]; then
    echo -e "${RED}❌ Múltiplas configurações ativas detectadas!${NC}"
    
    # Listar arquivos em sites-enabled
    echo -e "\n${YELLOW}Arquivos em sites-enabled com o domínio:${NC}"
    sudo grep -l "server_name.*$DOMAIN" /etc/nginx/sites-enabled/* 2>/dev/null
    
    # Backup das configurações
    echo -e "\n${BLUE}2. Fazendo backup das configurações...${NC}"
    sudo mkdir -p /etc/nginx/backup
    sudo cp -r /etc/nginx/sites-enabled /etc/nginx/backup/sites-enabled-$(date +%Y%m%d-%H%M%S)
    echo -e "${GREEN}✅ Backup criado${NC}"
    
    # Identificar qual configuração manter
    echo -e "\n${BLUE}3. Analisando configurações...${NC}"
    
    # Procurar pela configuração mais completa (com SSL)
    SSL_CONFIG=""
    for file in /etc/nginx/sites-enabled/*; do
        if sudo grep -q "server_name.*$DOMAIN" "$file" 2>/dev/null && sudo grep -q "ssl_certificate" "$file" 2>/dev/null; then
            SSL_CONFIG="$file"
            echo -e "${GREEN}✅ Configuração com SSL encontrada: $file${NC}"
            break
        fi
    done
    
    # Se encontrou configuração com SSL, desabilitar as outras
    if [ -n "$SSL_CONFIG" ]; then
        echo -e "\n${BLUE}4. Desabilitando configurações duplicadas...${NC}"
        for file in /etc/nginx/sites-enabled/*; do
            if [ "$file" != "$SSL_CONFIG" ] && sudo grep -q "server_name.*$DOMAIN" "$file" 2>/dev/null; then
                filename=$(basename "$file")
                echo -e "${YELLOW}Desabilitando: $filename${NC}"
                sudo rm "$file"
            fi
        done
    else
        echo -e "${YELLOW}⚠️  Nenhuma configuração com SSL encontrada${NC}"
        echo "Mantendo apenas a primeira configuração encontrada..."
        
        # Manter apenas a primeira configuração
        FIRST_CONFIG=$(sudo grep -l "server_name.*$DOMAIN" /etc/nginx/sites-enabled/* 2>/dev/null | head -1)
        if [ -n "$FIRST_CONFIG" ]; then
            echo -e "${GREEN}Mantendo: $FIRST_CONFIG${NC}"
            for file in /etc/nginx/sites-enabled/*; do
                if [ "$file" != "$FIRST_CONFIG" ] && sudo grep -q "server_name.*$DOMAIN" "$file" 2>/dev/null; then
                    filename=$(basename "$file")
                    echo -e "${YELLOW}Desabilitando: $filename${NC}"
                    sudo rm "$file"
                fi
            done
        fi
    fi
else
    echo -e "${GREEN}✅ Apenas uma configuração ativa encontrada${NC}"
fi

# Verificar também em conf.d
echo -e "\n${BLUE}5. Verificando /etc/nginx/conf.d/...${NC}"
CONFD_COUNT=$(sudo grep -r "server_name.*$DOMAIN" /etc/nginx/conf.d/ 2>/dev/null | grep -v "#" | wc -l)
if [ $CONFD_COUNT -gt 0 ]; then
    echo -e "${YELLOW}⚠️  Configurações encontradas em conf.d: $CONFD_COUNT${NC}"
    sudo grep -l "server_name.*$DOMAIN" /etc/nginx/conf.d/* 2>/dev/null
    echo -e "${YELLOW}Considere revisar estas configurações manualmente${NC}"
fi

# Testar configuração
echo -e "\n${BLUE}6. Testando configuração do Nginx...${NC}"
sudo nginx -t

if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Configuração válida${NC}"
    
    # Recarregar Nginx
    echo -e "\n${BLUE}7. Recarregando Nginx...${NC}"
    sudo systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Nginx recarregado com sucesso${NC}"
    else
        echo -e "${RED}❌ Erro ao recarregar Nginx${NC}"
    fi
else
    echo -e "${RED}❌ Erro na configuração do Nginx${NC}"
    echo -e "${YELLOW}Verifique os erros acima e corrija manualmente${NC}"
fi

# Mostrar configuração final
echo -e "\n${BLUE}8. Configuração final:${NC}"
echo -e "\n${YELLOW}Arquivos ativos em sites-enabled:${NC}"
ls -la /etc/nginx/sites-enabled/

echo -e "\n${YELLOW}Configurações do domínio $DOMAIN:${NC}"
sudo grep -r "server_name.*$DOMAIN" /etc/nginx/sites-enabled/ 2>/dev/null | grep -v "#"

echo -e "\n${GREEN}✅ Processo concluído!${NC}"
echo -e "\n${YELLOW}Dicas:${NC}"
echo "• Se ainda houver conflitos, verifique /etc/nginx/conf.d/"
echo "• Backups salvos em /etc/nginx/backup/"
echo "• Use 'sudo nginx -t' para testar a configuração"
echo "• Use 'sudo systemctl status nginx' para verificar o status" 
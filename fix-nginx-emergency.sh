#!/bin/bash

# Script de emergência para corrigir problemas do Nginx

echo "🚨 Diagnóstico e Correção de Emergência do Nginx"
echo "=============================================="

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

# 1. Verificar status atual
echo -e "\n${BLUE}1. Verificando status do Nginx...${NC}"
sudo systemctl status nginx --no-pager | head -20 || echo "Não foi possível obter status"

# 2. Testar configuração
echo -e "\n${BLUE}2. Testando configuração do Nginx...${NC}"
sudo nginx -t 2>&1

# 3. Verificar logs de erro
echo -e "\n${BLUE}3. Últimas linhas do log de erro...${NC}"
sudo tail -20 /var/log/nginx/error.log 2>/dev/null || echo "Log não encontrado"

# 4. Verificar portas em uso
echo -e "\n${BLUE}4. Verificando portas 80 e 443...${NC}"
sudo lsof -i :80 2>/dev/null || echo "Porta 80 livre"
sudo lsof -i :443 2>/dev/null || echo "Porta 443 livre"

# 5. Verificar arquivos de configuração
echo -e "\n${BLUE}5. Arquivos de configuração...${NC}"
ls -la /etc/nginx/sites-enabled/

# 6. Verificar sintaxe de cada arquivo
echo -e "\n${BLUE}6. Verificando sintaxe de cada arquivo...${NC}"
for file in /etc/nginx/sites-enabled/*; do
    if [ -f "$file" ]; then
        echo -e "\n${YELLOW}Arquivo: $file${NC}"
        sudo nginx -t -c /etc/nginx/nginx.conf 2>&1 | grep -A2 -B2 "$file" || echo "OK"
    fi
done

# 7. Verificar certificados SSL
echo -e "\n${BLUE}7. Verificando certificados SSL...${NC}"
SSL_PATH="/etc/letsencrypt/live/portal.sabercon.com.br"
if [ -d "$SSL_PATH" ]; then
    echo "Certificados encontrados em: $SSL_PATH"
    ls -la "$SSL_PATH/"
else
    echo -e "${YELLOW}⚠️  Diretório de certificados não encontrado${NC}"
fi

# 8. Propor correções
echo -e "\n${BLUE}8. Correções disponíveis:${NC}"
echo -e "\n${YELLOW}Opção 1: Restaurar configuração padrão${NC}"
echo "Esta opção criará uma configuração mínima funcional"

echo -e "\n${YELLOW}Opção 2: Desabilitar SSL temporariamente${NC}"
echo "Esta opção permitirá que o site funcione apenas em HTTP"

echo -e "\n${YELLOW}Opção 3: Corrigir manualmente${NC}"
echo "Identificar e corrigir o problema específico"

echo -e "\n❓ Escolha uma opção (1/2/3/n para cancelar): "
read -r opcao

case $opcao in
    1)
        echo -e "\n${BLUE}Criando configuração padrão...${NC}"
        
        # Backup
        sudo mv /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.error.$(date +%Y%m%d-%H%M%S)
        
        # Criar configuração mínima
        cat > /tmp/nginx-minimal.conf << 'EOF'
server {
    listen 80;
    server_name portal.sabercon.com.br;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
    
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
EOF
        
        sudo mv /tmp/nginx-minimal.conf /etc/nginx/sites-enabled/default
        sudo nginx -t && sudo systemctl restart nginx
        ;;
        
    2)
        echo -e "\n${BLUE}Removendo configuração SSL...${NC}"
        
        # Backup
        sudo cp /etc/nginx/sites-enabled/default /etc/nginx/sites-enabled/default.ssl.backup
        
        # Remover linhas SSL
        sudo sed -i '/listen 443/d' /etc/nginx/sites-enabled/default
        sudo sed -i '/ssl_certificate/d' /etc/nginx/sites-enabled/default
        sudo sed -i '/ssl_/d' /etc/nginx/sites-enabled/default
        
        sudo nginx -t && sudo systemctl restart nginx
        ;;
        
    3)
        echo -e "\n${BLUE}Abrindo editor para correção manual...${NC}"
        sudo nano /etc/nginx/sites-enabled/default
        
        echo -e "\n${BLUE}Testando configuração após edição...${NC}"
        sudo nginx -t && sudo systemctl restart nginx
        ;;
        
    *)
        echo -e "${RED}Operação cancelada${NC}"
        ;;
esac

# Status final
echo -e "\n${BLUE}Status final:${NC}"
sudo systemctl status nginx --no-pager | head -10

echo -e "\n${YELLOW}💡 Comandos úteis:${NC}"
echo "• sudo nginx -t                    - Testar configuração"
echo "• sudo systemctl restart nginx     - Reiniciar Nginx"
echo "• sudo journalctl -u nginx -n 50   - Ver logs detalhados"
echo "• sudo tail -f /var/log/nginx/error.log - Monitorar erros" 
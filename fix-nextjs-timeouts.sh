#!/bin/bash

# Script para corrigir timeout do Next.js Stack Frames
# Resolve erro 504 Gateway Timeout em /__nextjs_original-stack-frames

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${YELLOW}🔧 Correção de Timeout - Next.js Stack Frames${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

# Verificar se está rodando como root
if [ "$EUID" -ne 0 ]; then
    echo -e "${RED}❌ Este script precisa ser executado como root${NC}"
    echo -e "${YELLOW}   Use: sudo bash fix-nextjs-timeouts.sh${NC}"
    exit 1
fi

# Verificar se o Nginx está instalado
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}❌ Nginx não está instalado${NC}"
    exit 1
fi

# Fazer backup da configuração atual
BACKUP_FILE="/etc/nginx/sites-available/default.backup-$(date +%Y%m%d-%H%M%S)"
echo -e "${BLUE}📋 Fazendo backup da configuração atual...${NC}"
cp /etc/nginx/sites-available/default "$BACKUP_FILE"
echo -e "${GREEN}✅ Backup salvo em: $BACKUP_FILE${NC}"

# Criar arquivo temporário com a nova configuração
TEMP_FILE=$(mktemp)

# Verificar se a configuração já existe
if grep -q "__nextjs_original-stack-frame" /etc/nginx/sites-available/default; then
    echo -e "${YELLOW}⚠️  Configuração para Next.js já existe. Atualizando timeouts...${NC}"
    
    # Atualizar timeouts existentes
    sed -i '/__nextjs_original-stack-frame/,/^[[:space:]]*}/ {
        s/proxy_connect_timeout [0-9]*s;/proxy_connect_timeout 300s;/
        s/proxy_send_timeout [0-9]*s;/proxy_send_timeout 300s;/
        s/proxy_read_timeout [0-9]*s;/proxy_read_timeout 300s;/
    }' /etc/nginx/sites-available/default
else
    echo -e "${BLUE}📝 Adicionando configuração para Next.js endpoints...${NC}"
    
    # Adicionar nova configuração antes da location /
    awk '
    /^[[:space:]]*location \/ \{/ {
        print "    # Next.js development endpoints (stack traces, HMR, etc)"
        print "    location ~ ^/(_next/webpack-hmr|__nextjs_original-stack-frame) {"
        print "        proxy_pass http://frontend_backend;"
        print "        proxy_http_version 1.1;"
        print "        proxy_set_header Upgrade $http_upgrade;"
        print "        proxy_set_header Connection '\''upgrade'\'';"
        print "        proxy_set_header Host $host;"
        print "        proxy_set_header X-Real-IP $remote_addr;"
        print "        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;"
        print "        proxy_set_header X-Forwarded-Proto $scheme;"
        print "        proxy_set_header X-Forwarded-Host $host;"
        print "        proxy_set_header X-Forwarded-Port $server_port;"
        print "        "
        print "        # Timeouts aumentados para stack traces"
        print "        proxy_connect_timeout 300s;"
        print "        proxy_send_timeout 300s;"
        print "        proxy_read_timeout 300s;"
        print "        "
        print "        # Desabilitar buffering para respostas em tempo real"
        print "        proxy_buffering off;"
        print "        proxy_cache off;"
        print "        "
        print "        # Aumentar tamanho dos buffers"
        print "        proxy_buffer_size 128k;"
        print "        proxy_buffers 4 256k;"
        print "        proxy_busy_buffers_size 256k;"
        print "        "
        print "        # Permitir bodies grandes para stack traces"
        print "        client_max_body_size 10M;"
        print "        client_body_buffer_size 128k;"
        print "    }"
        print ""
    }
    { print }
    ' /etc/nginx/sites-available/default > "$TEMP_FILE"
    
    # Substituir arquivo original
    mv "$TEMP_FILE" /etc/nginx/sites-available/default
fi

# Adicionar também timeouts gerais aumentados se não existirem
echo -e "${BLUE}📝 Verificando timeouts gerais do Nginx...${NC}"

# Verificar e atualizar timeouts no nginx.conf
if ! grep -q "proxy_connect_timeout" /etc/nginx/nginx.conf; then
    echo -e "${BLUE}📝 Adicionando timeouts gerais ao nginx.conf...${NC}"
    
    # Adicionar dentro do bloco http
    sed -i '/^http {/a\
    \
    # Timeouts gerais para evitar 504 Gateway Timeout\
    proxy_connect_timeout 300s;\
    proxy_send_timeout 300s;\
    proxy_read_timeout 300s;\
    send_timeout 300s;\
    \
    # Buffers otimizados\
    proxy_buffer_size 128k;\
    proxy_buffers 4 256k;\
    proxy_busy_buffers_size 256k;\
    proxy_temp_file_write_size 256k;' /etc/nginx/nginx.conf
fi

# Testar configuração
echo -e "${BLUE}🧪 Testando configuração do Nginx...${NC}"
if nginx -t 2>&1; then
    echo -e "${GREEN}✅ Configuração do Nginx válida${NC}"
    
    # Recarregar Nginx
    echo -e "${BLUE}🔄 Recarregando Nginx...${NC}"
    systemctl reload nginx
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ Nginx recarregado com sucesso${NC}"
    else
        echo -e "${RED}❌ Erro ao recarregar Nginx${NC}"
        echo -e "${YELLOW}   Restaurando backup...${NC}"
        cp "$BACKUP_FILE" /etc/nginx/sites-available/default
        systemctl reload nginx
        exit 1
    fi
else
    echo -e "${RED}❌ Erro na configuração do Nginx${NC}"
    echo -e "${YELLOW}   Restaurando backup...${NC}"
    cp "$BACKUP_FILE" /etc/nginx/sites-available/default
    nginx -t
    exit 1
fi

# Verificar se o Nginx está respondendo
echo -e "${BLUE}🔍 Verificando status do Nginx...${NC}"
if systemctl is-active --quiet nginx; then
    echo -e "${GREEN}✅ Nginx está ativo e rodando${NC}"
else
    echo -e "${RED}❌ Nginx não está ativo${NC}"
    systemctl status nginx
    exit 1
fi

# Mostrar resumo
echo ""
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${GREEN}✅ Correção aplicada com sucesso!${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo -e "${YELLOW}📋 Alterações aplicadas:${NC}"
echo -e "   • Timeout aumentado para 300s nos endpoints do Next.js"
echo -e "   • Buffering desabilitado para respostas em tempo real"
echo -e "   • Buffers aumentados para suportar stack traces grandes"
echo -e "   • Configuração otimizada para /__nextjs_original-stack-frames"
echo ""
echo -e "${YELLOW}🔍 Para verificar:${NC}"
echo -e "   • Logs de erro: tail -f /var/log/nginx/error.log"
echo -e "   • Logs de acesso: tail -f /var/log/nginx/access.log | grep nextjs"
echo -e "   • Status: systemctl status nginx"
echo ""
echo -e "${GREEN}✨ O erro 504 Gateway Timeout deve estar resolvido!${NC}"

# Criar script de verificação
cat > /tmp/check-nextjs-timeout.sh << 'EOF'
#!/bin/bash
echo "Verificando configuração de timeout do Next.js..."
echo ""
echo "1. Configuração no Nginx:"
grep -A 20 "__nextjs_original-stack-frame" /etc/nginx/sites-available/default | grep -E "(timeout|buffer)"
echo ""
echo "2. Últimos erros 504:"
grep "504" /var/log/nginx/access.log | tail -5
echo ""
echo "3. Status do Nginx:"
systemctl status nginx --no-pager | head -10
EOF

chmod +x /tmp/check-nextjs-timeout.sh

echo ""
echo -e "${BLUE}💡 Script de verificação criado:${NC}"
echo -e "   /tmp/check-nextjs-timeout.sh"
echo ""
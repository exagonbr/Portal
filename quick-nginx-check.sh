#!/bin/bash

# Script rápido para verificar configurações duplicadas do Nginx

echo "🔍 Verificação rápida do Nginx para portal.sabercon.com.br"
echo "================================================"

# Listar todos os arquivos de configuração ativos
echo -e "\n📁 Arquivos em /etc/nginx/sites-enabled/:"
ls -la /etc/nginx/sites-enabled/

# Procurar por configurações do domínio
echo -e "\n🔎 Configurações com 'portal.sabercon.com.br':"
sudo grep -n "server_name.*portal.sabercon.com.br" /etc/nginx/sites-enabled/* 2>/dev/null

# Verificar portas 80 e 443
echo -e "\n🔌 Configurações na porta 80 (HTTP):"
sudo grep -B2 -A2 "listen.*80" /etc/nginx/sites-enabled/* 2>/dev/null | grep -E "listen|server_name.*portal"

echo -e "\n🔐 Configurações na porta 443 (HTTPS):"
sudo grep -B2 -A2 "listen.*443" /etc/nginx/sites-enabled/* 2>/dev/null | grep -E "listen|server_name.*portal"

# Testar configuração
echo -e "\n✅ Teste de configuração:"
sudo nginx -t

echo -e "\n💡 Se houver conflitos, execute:"
echo "   sudo ./fix-nginx-conflict.sh" 
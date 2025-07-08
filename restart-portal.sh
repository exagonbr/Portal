#!/bin/bash

# Script para reiniciar o portal após correções
echo "Reiniciando o Portal Sabercon..."

# Parar o serviço atual
echo "Parando o serviço..."
pm2 stop portal || true

# Limpar cache
echo "Limpando cache..."
rm -rf .next/cache

# Reconstruir a aplicação
echo "Reconstruindo a aplicação..."
npm run build

# Reiniciar o serviço
echo "Reiniciando o serviço..."
pm2 start portal

echo "Portal reiniciado com sucesso!"
echo "Verifique os logs com: pm2 logs portal" 
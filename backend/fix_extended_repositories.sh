#!/bin/bash

# Script para corrigir repositórios que estendem ExtendedRepository
echo "Corrigindo repositórios que estendem ExtendedRepository..."

# Primeiro, corrigir o ExtendedRepository.ts
cd /var/www/portal/backend/src/repositories

echo "Corrigindo ExtendedRepository.ts..."
# Remover a linha duplicada de construtor e repository
sed -i '/private repository: Repository<Extended>;/d' ExtendedRepository.ts
sed -i '/this.repository = AppDataSource.getRepository(Extended);/d' ExtendedRepository.ts

# Agora, corrigir todos os repositórios que estendem ExtendedRepository
for file in *.ts; do
  if grep -q "extends ExtendedRepository" "$file"; then
    echo "Corrigindo $file..."
    
    # Extrair o nome da entidade
    entityName=$(echo "$file" | sed 's/Repository.ts$//')
    
    # Corrigir o construtor para chamar super() antes de this
    sed -i '/constructor()/,/}/c\
  constructor() {\
    super("'$(echo $entityName | tr '[:upper:]' '[:lower:]')'s");\
  }' "$file"
    
    # Remover a linha de declaração de repository privado
    sed -i '/private repository: Repository<.*>;/d' "$file"
    
    # Remover a linha de inicialização de repository com AppDataSource
    sed -i '/this.repository = AppDataSource.getRepository(/d' "$file"
  fi
done

echo "Correção de repositórios estendidos concluída!" 
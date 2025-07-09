#!/bin/bash

# Script para corrigir erros comuns de TypeScript em controllers e repositories
echo "Iniciando correção de erros TypeScript em controllers e repositories..."

# Parte 1: Corrigir Controllers
echo "Corrigindo Controllers..."
cd /var/www/portal/backend/src/controllers

for file in *.ts; do
  if [[ "$file" != "BaseController.ts" && "$file" != "fix_controllers.sh" ]]; then
    echo "Processando controller: $file"
    
    # Extrair o nome do repositório do arquivo (Ex: AnnouncementController.ts -> AnnouncementRepository)
    repoName=$(echo "$file" | sed 's/Controller.ts$/Repository/')
    
    # Extrair o nome da entidade (Ex: AnnouncementController.ts -> Announcement)
    entityName=$(echo "$file" | sed 's/Controller.ts$//')
    
    # Nome da propriedade do repositório em camelCase (Ex: announcementRepository)
    propName=$(echo "$entityName" | sed 's/^./\L&/' | sed 's/$/Repository/')
    
    # Corrigir a declaração da propriedade e inicialização no construtor
    sed -i "s/private [a-zA-Z]*[Rr]epository: [a-zA-Z]*[Rr]epository;/private $propName: $repoName;/g" "$file"
    sed -i "s/private [a-zA-Z]*[Rr]epository;/private $propName: $repoName;/g" "$file"
    
    # Corrigir inicialização no construtor
    sed -i "s/this\.[a-zA-Z]*[Rr]epository = repository;/this.$propName = repository;/g" "$file"
    sed -i "s/this\.repository = repository;/this.$propName = repository;/g" "$file"
    
    # Corrigir referências ao repositório sem this
    sed -i "s/await \([^.]*\)$propName/await this.$propName/g" "$file"
    sed -i "s/const [a-zA-Z]* = $propName\./const \0 = this.$propName./g" "$file"
    sed -i "s/await $propName\./await this.$propName./g" "$file"
    sed -i "s/ $propName\./ this.$propName./g" "$file"
  fi
done

# Parte 2: Corrigir Repositories
echo "Corrigindo Repositories..."
cd /var/www/portal/backend/src/repositories

for file in *.ts; do
  if [[ "$file" != "BaseRepository.ts" ]]; then
    echo "Processando repository: $file"
    
    # Extrair o nome da entidade (Ex: AnnouncementRepository.ts -> Announcement)
    entityName=$(echo "$file" | sed 's/Repository.ts$//')
    
    # Adicionar importação do AppDataSource se não existir
    if ! grep -q "import { AppDataSource }" "$file"; then
      sed -i '1s/^/import { AppDataSource } from "../data-source";\n/' "$file"
    fi
    
    # Adicionar importação do Repository do typeorm se não existir
    if ! grep -q "import { Repository }" "$file"; then
      sed -i '1s/^/import { Repository } from "typeorm";\n/' "$file"
    fi
    
    # Adicionar declaração da propriedade repository se não existir
    if ! grep -q "private repository:" "$file"; then
      sed -i "/class $entityName/a \ \ private repository: Repository<$entityName>;" "$file"
    fi
    
    # Adicionar inicialização do repository no construtor se não existir
    if ! grep -q "this.repository = AppDataSource.getRepository" "$file"; then
      # Verificar se existe um construtor
      if grep -q "constructor()" "$file"; then
        # Adicionar inicialização no construtor existente
        sed -i "/constructor()/a \ \ \ \ this.repository = AppDataSource.getRepository($entityName);" "$file"
      else
        # Criar um novo construtor
        sed -i "/class $entityName/a \ \ constructor() {\n\ \ \ \ this.repository = AppDataSource.getRepository($entityName);\n\ \ }" "$file"
      fi
    fi
  fi
done

echo "Correção concluída!" 
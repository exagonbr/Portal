#!/bin/bash

# Cores para saída
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}[INFO]${NC} Iniciando correção de repositórios TypeORM..."

# Diretório dos repositórios
REPO_DIR="./backend/src/repositories"
ENTITY_DIR="./backend/src/entities"

# Verificar se o diretório existe
if [ ! -d "$REPO_DIR" ]; then
  echo -e "${RED}[ERROR]${NC} Diretório de repositórios não encontrado: $REPO_DIR"
  exit 1
fi

# Função para corrigir um repositório
fix_repository() {
  local file=$1
  local entity_name=$2
  local table_name=$3
  
  echo -e "${YELLOW}[INFO]${NC} Corrigindo repositório: $file"
  
  # Backup do arquivo original
  cp "$file" "$file.bak"
  
  # Verificar se o arquivo já tem a importação do AppDataSource
  if ! grep -q "import { AppDataSource }" "$file"; then
    sed -i '1i import { AppDataSource } from "../config/typeorm.config";' "$file"
  fi
  
  # Verificar se o arquivo já tem a importação do Repository
  if ! grep -q "import { Repository }" "$file"; then
    sed -i '1i import { Repository } from "typeorm";' "$file"
  fi
  
  # Adicionar propriedade repository
  if ! grep -q "private repository:" "$file"; then
    sed -i "/extends ExtendedRepository<$entity_name>/a \ \ private repository: Repository<$entity_name>;" "$file"
  fi
  
  # Corrigir construtor
  sed -i "/constructor()/,/}/c\\
  constructor() {\\
    super(\"$table_name\");\\
    this.repository = AppDataSource.getRepository($entity_name);\\
  }" "$file"
  
  echo -e "${GREEN}[SUCCESS]${NC} Repositório $file corrigido"
}

# Processar todos os arquivos de repositório
for file in $REPO_DIR/*Repository.ts; do
  if [ -f "$file" ]; then
    # Extrair nome do arquivo sem caminho e extensão
    filename=$(basename "$file")
    
    # Extrair nome da entidade (remover "Repository.ts")
    entity_name=${filename%Repository.ts}
    
    # Determinar nome da tabela (versão em minúsculas e plural)
    table_name=$(echo $entity_name | tr '[:upper:]' '[:lower:]')s
    
    # Verificar se o arquivo estende ExtendedRepository
    if grep -q "extends ExtendedRepository" "$file"; then
      fix_repository "$file" "$entity_name" "$table_name"
    fi
  fi
done

echo -e "${GREEN}[SUCCESS]${NC} Correção de repositórios concluída!" 
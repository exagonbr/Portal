#!/bin/bash

echo "Iniciando correção de imports duplicados nos repositórios..."

# Função para corrigir um arquivo de repositório
fix_repository_file() {
  local file=$1
  echo "Processando $file..."
  
  # Fazer backup do arquivo
  cp "$file" "${file}.bak"
  
  # Remover imports duplicados de Repository
  sed -i '/import { Repository } from "typeorm";/d' "$file"
  sed -i '1s/^/import { Repository } from "typeorm";\n/' "$file"
  
  # Remover imports duplicados de ExtendedRepository e PaginatedResult
  sed -i '/import { ExtendedRepository, PaginatedResult } from/d' "$file"
  sed -i '1s/^/import { ExtendedRepository, PaginatedResult } from ".\/ExtendedRepository";\n/' "$file"
  
  # Corrigir BaseRepository para Repository
  sed -i 's/BaseRepository/Repository/g' "$file"
  
  echo "✅ Arquivo $file corrigido"
}

# Processar arquivos de repositório específicos com problemas
echo "Corrigindo repositórios com problemas..."

# Lista de arquivos com problemas conhecidos
problem_files=(
  "src/repositories/ChatRepository.ts"
  "src/repositories/ClassesRepository.ts"
  "src/repositories/ContentCollectionRepository.ts"
  "src/repositories/EducationCyclesRepository.ts"
  "src/repositories/FileRepository.ts"
  "src/repositories/ForumRepository.ts"
  "src/repositories/GroupRepository.ts"
  "src/repositories/UnitsRepository.ts"
)

# Processar cada arquivo
for file in "${problem_files[@]}"; do
  if [ -f "$file" ]; then
    fix_repository_file "$file"
  else
    echo "⚠️ Arquivo $file não encontrado"
  fi
done

echo "Processo concluído. Verifique se há erros de compilação executando:"
echo "npx tsc --noEmit" 
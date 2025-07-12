#!/bin/bash

# Diretório onde os arquivos de rota estão localizados
ROUTE_DIR="backend/src/routes"

# Verificar se o diretório existe
if [ ! -d "$ROUTE_DIR" ]; then
  echo "Diretório não encontrado: $ROUTE_DIR"
  exit 1
fi

# Loop através de todos os arquivos .ts no diretório
for file in $(find "$ROUTE_DIR" -type f -name "*.ts"); do
  echo "Processando arquivo: $file"
  
  # Substituir .getAll por .findAll
  sed -i 's/\.getAll/\.findAll/g' "$file"
  
  # Substituir .getById por .findById
  sed -i 's/\.getById/\.findById/g' "$file"
  
  # Substituir .remove( por .delete( para evitar substituições indesejadas
  sed -i 's/\.remove(/\.delete(/g' "$file"
  
  # Substituir .search por .findAll
  sed -i 's/\.search/\.findAll/g' "$file"
done

echo "Substituições concluídas."
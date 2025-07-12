#!/bin/bash

echo "Iniciando correção de erros nos DTOs..."

# Função para corrigir um arquivo DTO
fix_dto_file() {
  local file=$1
  echo "Processando $file..."
  
  # Fazer backup do arquivo
  cp "$file" "${file}.bak"
  
  # Substituir declarações de propriedades sem inicializadores
  sed -i 's/\(\s*\)\([a-zA-Z0-9_]*\): string;/\1\2: string = "";/g' "$file"
  sed -i 's/\(\s*\)\([a-zA-Z0-9_]*\): number;/\1\2: number = 0;/g' "$file"
  sed -i 's/\(\s*\)\([a-zA-Z0-9_]*\): boolean;/\1\2: boolean = false;/g' "$file"
  sed -i 's/\(\s*\)\([a-zA-Z0-9_]*\): Date;/\1\2: Date = new Date();/g' "$file"
  
  echo "✅ Arquivo $file corrigido"
}

# Processar todos os arquivos DTO
echo "Procurando arquivos DTO..."
find src/dtos -name "*.ts" | while read -r file; do
  fix_dto_file "$file"
done

echo "Processo concluído. Verifique se há erros de compilação executando:"
echo "npx tsc --noEmit" 
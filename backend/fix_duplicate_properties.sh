#!/bin/bash

# Script para corrigir propriedades duplicadas em controllers
echo "Corrigindo propriedades duplicadas em controllers..."

cd /var/www/portal/backend/src/controllers

# Remover linhas duplicadas de propriedades de repositório
for file in *.ts; do
  if grep -q "private.*Repository" "$file"; then
    echo "Verificando $file..."
    
    # Usar awk para encontrar e remover linhas duplicadas de propriedades
    awk '
    BEGIN { count=0; }
    /private [a-zA-Z]+[Rr]epository:/ { 
      count++; 
      if (count == 1) print $0;
      next;
    }
    { print $0; }
    ' "$file" > "${file}.tmp" && mv "${file}.tmp" "$file"
    
    # Remover linhas em branco duplicadas
    sed -i '/^$/N;/^\n$/D' "$file"
  fi
done

echo "Correção de propriedades duplicadas concluída!" 
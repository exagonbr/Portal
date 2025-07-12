#!/bin/bash

echo "Iniciando correção de exports nos controllers..."

# Função para corrigir um arquivo de controller
fix_controller_file() {
  local file=$1
  echo "Processando $file..."
  
  # Fazer backup do arquivo
  cp "$file" "${file}.bak"
  
  # Verificar se o arquivo usa export default ou export class
  if grep -q "export default" "$file"; then
    echo "✅ Arquivo $file já usa export default"
  else
    # Substituir "export class" por "class" e adicionar export default no final
    sed -i 's/export class \([A-Za-z]*\)Controller/class \1Controller/g' "$file"
    
    # Pegar o nome da classe do controller
    controller_name=$(grep "class [A-Za-z]*Controller" "$file" | sed -E 's/.*class ([A-Za-z]*)Controller.*/\1Controller/')
    
    # Adicionar export default no final do arquivo
    echo -e "\nexport default $controller_name;" >> "$file"
    
    echo "✅ Arquivo $file modificado para usar export default"
  fi
}

# Processar todos os arquivos de controller
echo "Procurando arquivos de controller..."
find src/controllers -name "*Controller.ts" | while read -r file; do
  fix_controller_file "$file"
done

echo "Processo concluído. Verifique se há erros de compilação executando:"
echo "npx tsc --noEmit" 
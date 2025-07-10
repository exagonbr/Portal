#!/bin/bash

echo "Iniciando correção de imports nos arquivos de rotas..."

# Função para corrigir um arquivo de rota
fix_route_file() {
  local file=$1
  echo "Processando $file..."
  
  # Fazer backup do arquivo
  cp "$file" "${file}.bak"
  
  # Extrair o nome do controller do arquivo
  controller_name=$(basename "$file" .ts)
  controller_class=$(echo "$controller_name" | sed -r 's/(^|_)([a-z])/\U\2/g')Controller
  
  # Substituir imports com chaves por imports default
  sed -i "s/import { ${controller_class} } from '..\/controllers\/${controller_class}';/import ${controller_class} from '..\/controllers\/${controller_class}';/g" "$file"
  
  echo "✅ Arquivo $file corrigido"
}

# Processar todos os arquivos de rotas
echo "Procurando arquivos de rotas..."
find src/routes -name "*.ts" | while read -r file; do
  fix_route_file "$file"
done

# Corrigir métodos específicos nos arquivos de rotas
echo "Corrigindo métodos específicos nos arquivos de rotas..."

# Lista de arquivos com problemas conhecidos
problem_files=(
  "src/routes/theme.ts"
  "src/routes/tv_show.ts"
  "src/routes/unit.ts"
  "src/routes/video.ts"
)

# Processar cada arquivo com problemas
for file in "${problem_files[@]}"; do
  if [ -f "$file" ]; then
    echo "Corrigindo métodos em $file..."
    
    # Fazer backup do arquivo se ainda não foi feito
    if [ ! -f "${file}.bak" ]; then
      cp "$file" "${file}.bak"
    fi
    
    # Substituir findAll por getAll e findById por getById
    sed -i 's/findAll/getAll/g' "$file"
    sed -i 's/findById/getById/g' "$file"
    
    echo "✅ Métodos em $file corrigidos"
  else
    echo "⚠️ Arquivo $file não encontrado"
  fi
done

echo "Processo concluído. Verifique se há erros de compilação executando:"
echo "npx tsc --noEmit" 
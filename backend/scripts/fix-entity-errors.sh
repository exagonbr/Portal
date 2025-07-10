#!/bin/bash

echo "Iniciando correção de erros nas entidades..."

# Corrigir Classes.ts
if [ -f "src/entities/Classes.ts" ]; then
  echo "Corrigindo src/entities/Classes.ts..."
  
  # Fazer backup do arquivo
  cp "src/entities/Classes.ts" "src/entities/Classes.ts.bak"
  
  # Adicionar import para Unit se não existir
  if ! grep -q "import { Unit } from './Unit';" "src/entities/Classes.ts"; then
    sed -i '1s/^/import { Unit } from ".\/Unit";\n/' "src/entities/Classes.ts"
  fi
  
  # Adicionar import para EducationCycle se não existir
  if ! grep -q "import { EducationCycle } from './EducationCycle';" "src/entities/Classes.ts"; then
    sed -i '1s/^/import { EducationCycle } from ".\/EducationCycle";\n/' "src/entities/Classes.ts"
  fi
  
  echo "✅ src/entities/Classes.ts corrigido"
fi

# Corrigir EducationCycles.ts
if [ -f "src/entities/EducationCycles.ts" ]; then
  echo "Corrigindo src/entities/EducationCycles.ts..."
  
  # Fazer backup do arquivo
  cp "src/entities/EducationCycles.ts" "src/entities/EducationCycles.ts.bak"
  
  # Adicionar import para Institution se não existir
  if ! grep -q "import { Institution } from './Institution';" "src/entities/EducationCycles.ts"; then
    sed -i '1s/^/import { Institution } from ".\/Institution";\n/' "src/entities/EducationCycles.ts"
  fi
  
  echo "✅ src/entities/EducationCycles.ts corrigido"
fi

# Corrigir Report.ts
if [ -f "src/entities/Report.ts" ]; then
  echo "Corrigindo src/entities/Report.ts..."
  
  # Fazer backup do arquivo
  cp "src/entities/Report.ts" "src/entities/Report.ts.bak"
  
  # Adicionar import para User (CreatedBy) se não existir
  if ! grep -q "import { User } from './User';" "src/entities/Report.ts"; then
    sed -i '1s/^/import { User } from ".\/User";\n/' "src/entities/Report.ts"
  fi
  
  # Adicionar import para Video se não existir
  if ! grep -q "import { Video } from './Video';" "src/entities/Report.ts"; then
    sed -i '1s/^/import { Video } from ".\/Video";\n/' "src/entities/Report.ts"
  fi
  
  # Substituir CreatedBy por User
  sed -i 's/CreatedBy/User/g' "src/entities/Report.ts"
  
  echo "✅ src/entities/Report.ts corrigido"
fi

echo "Processo concluído. Verifique se há erros de compilação executando:"
echo "npx tsc --noEmit" 
/**
 * Este script corrige as importações de componentes UI em todo o projeto
 * Para executar: npx ts-node src/fix-imports.ts
 */

import fs from 'fs';
import path from 'path';
import { glob } from 'glob';

// Mapeamento de como cada componente deve ser importado
const importMap: Record<string, string> = {
  // Default exports
  'Card': "import Card, { CardHeader, CardBody, CardFooter } from '@/components/ui/Card';",
  // Named exports
  'Button': "import { Button, ButtonGroup } from '@/components/ui/Button';",
  'Input': "import Input from '@/components/ui/Input';;",
  'Textarea': "import { Textarea } from '@/components/ui/Textarea';;",
  'Select': "import { Select } from '@/components/ui/Select';;",
};

// Padrões regex para detectar importações
const importPatterns: Record<string, RegExp> = {
  'Card': /import\s+(?:{\s*)?(?:Card)(?:\s*})?\s+from\s+['"]@\/components\/ui\/Card['"]/g,
  'Button': /import\s+(?:{\s*)?(?:Button)(?:\s*})?\s+from\s+['"]@\/components\/ui\/Button['"]/g,
  'Input': /import\s+(?:{\s*)?(?:Input)(?:\s*})?\s+from\s+['"]@\/components\/ui\/Input['"]/g,
  'Textarea': /import\s+(?:{\s*)?(?:Textarea)(?:\s*})?\s+from\s+['"]@\/components\/ui\/Textarea['"]/g,
  'Select': /import\s+(?:{\s*)?(?:Select)(?:\s*})?\s+from\s+['"]@\/components\/ui\/Select['"]/g,
};

async function main() {
  const files = await glob('src/**/*.{ts,tsx}', { ignore: ['**/node_modules/**'] });
  
  for (const file of files) {
    let content = fs.readFileSync(file, 'utf-8');
    let hasChanged = false;
    
    // Verifica cada padrão de importação
    for (const component of Object.keys(importPatterns)) {
      const pattern = importPatterns[component];
      if (pattern.test(content)) {
        content = content.replace(pattern, importMap[component]);
        hasChanged = true;
        console.log(`Fixed ${component} import in ${file}`);
      }
    }
    
    // Salva o arquivo se houver mudanças
    if (hasChanged) {
      fs.writeFileSync(file, content, 'utf-8');
    }
  }
  
  console.log('Import fixing completed!');
}

main().catch(console.log); 
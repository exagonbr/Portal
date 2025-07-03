import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const API_DIR = path.join(__dirname, '../src/app/api');

const filesToKeep = [
  'src/app/api/auth/login/route.ts',
  'src/app/api/auth/logout/route.ts',
  'src/app/api/auth/refresh/route.ts',
  'src/app/api/auth/register/route.ts',
  'src/app/api/auth/session/route.ts',
  'src/app/api/auth/validate/route.ts',
  'src/app/api/auth/[...nextauth]/route.ts',
  'src/app/api/auth/_log/route.ts',
];

function cleanupRoutes(dir: string) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relativePath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');

    if (entry.isDirectory()) {
      // Não apagar o diretório [...slug]
      if (entry.name === '[...slug]') {
        continue;
      }
      cleanupRoutes(fullPath);
      // Remove diretório se estiver vazio após a limpeza
      if (fs.readdirSync(fullPath).length === 0) {
        console.log(`🗑️ Removendo diretório vazio: ${relativePath}`);
        fs.rmdirSync(fullPath);
      }
    } else if (entry.name === 'route.ts') {
      if (!filesToKeep.includes(relativePath)) {
        console.log(`🗑️ Removendo rota: ${relativePath}`);
        fs.unlinkSync(fullPath);
      }
    }
  }
}

console.log('🧹 Iniciando limpeza de rotas...');
cleanupRoutes(API_DIR);
console.log('✅ Limpeza concluída.');
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const chalk = require('chalk');

console.log(chalk.blue.bold('\n🔧 Corrigindo erros de chunks do PWA...\n'));

// 1. Limpar diretório .next
console.log(chalk.yellow('1. Limpando cache do Next.js...'));
const nextDir = path.join(process.cwd(), '.next');
if (fs.existsSync(nextDir)) {
  fs.rmSync(nextDir, { recursive: true, force: true });
  console.log(chalk.green('✅ Cache do Next.js limpo'));
} else {
  console.log(chalk.gray('ℹ️  Diretório .next não encontrado'));
}

// 2. Limpar cache do node_modules
console.log(chalk.yellow('\n2. Limpando cache do node_modules...'));
const cacheDir = path.join(process.cwd(), 'node_modules', '.cache');
if (fs.existsSync(cacheDir)) {
  fs.rmSync(cacheDir, { recursive: true, force: true });
  console.log(chalk.green('✅ Cache do node_modules limpo'));
} else {
  console.log(chalk.gray('ℹ️  Cache do node_modules não encontrado'));
}

// 3. Limpar cache do SWC
console.log(chalk.yellow('\n3. Limpando cache do SWC...'));
const swcDir = path.join(process.cwd(), '.swc');
if (fs.existsSync(swcDir)) {
  fs.rmSync(swcDir, { recursive: true, force: true });
  console.log(chalk.green('✅ Cache do SWC limpo'));
} else {
  console.log(chalk.gray('ℹ️  Diretório .swc não encontrado'));
}

// 4. Atualizar service worker com melhor tratamento de erros
console.log(chalk.yellow('\n4. Atualizando Service Worker...'));
const swPath = path.join(process.cwd(), 'public', 'sw.js');
const swContent = fs.readFileSync(swPath, 'utf8');

// Adicionar tratamento melhorado de erros no service worker
const improvedSW = swContent.replace(
  '// Interceptar requisições',
  `// Função para verificar se é um erro de chunk
function isChunkError(error) {
  return error && (
    error.message.includes('Loading chunk') ||
    error.message.includes('ChunkLoadError') ||
    error.message.includes('originalFactory')
  );
}

// Interceptar requisições`
);

// Adicionar retry para chunks falhados
const swWithRetry = improvedSW.replace(
  'async function networkOnlyStrategy(request) {',
  `// Função para retry de requisições
async function fetchWithRetry(request, retries = 3) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(request.clone());
      if (response.ok) return response;
      
      // Se não for ok e for a última tentativa, retornar a resposta de erro
      if (i === retries - 1) return response;
      
      // Aguardar antes de tentar novamente
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    } catch (error) {
      if (i === retries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * (i + 1)));
    }
  }
}

async function networkOnlyStrategy(request) {`
);

// Usar fetchWithRetry para chunks
const finalSW = swWithRetry.replace(
  'return await fetch(request);',
  `// Usar retry para chunks JavaScript
    if (request.url.includes('/_next/static/chunks/')) {
      return await fetchWithRetry(request, 3);
    }
    return await fetch(request);`
);

fs.writeFileSync(swPath, finalSW);
console.log(chalk.green('✅ Service Worker atualizado com melhor tratamento de erros'));

// 5. Criar arquivo de configuração para resolver problemas de chunks
console.log(chalk.yellow('\n5. Criando configuração de chunks...'));
const chunkConfigPath = path.join(process.cwd(), 'public', 'chunk-config.js');
const chunkConfig = `// Configuração para resolver problemas de chunks
(function() {
  if (typeof window === 'undefined') return;
  
  // Configurar timeout maior para chunks
  if (window.__webpack_require__) {
    window.__webpack_require__.l.timeout = 120000; // 2 minutos
  }
  
  // Interceptar erros de chunk
  const originalError = window.onerror;
  window.onerror = function(msg, url, line, col, error) {
    if (error && (
      error.message.includes('Loading chunk') ||
      error.message.includes('originalFactory') ||
      error.message.includes("reading 'call'")
    )) {
      console.warn('🔄 Erro de chunk detectado, tentando recuperar...');
      
      // Limpar cache de módulos problemáticos
      if (window.__webpack_require__ && window.__webpack_require__.cache) {
        const cache = window.__webpack_require__.cache;
        Object.keys(cache).forEach(key => {
          if (key.includes('chunk')) {
            delete cache[key];
          }
        });
      }
      
      // Tentar recarregar após um delay
      setTimeout(() => {
        console.log('🔄 Recarregando página para resolver erro de chunk...');
        window.location.reload();
      }, 2000);
      
      return true; // Prevenir erro no console
    }
    
    // Chamar handler original se não for erro de chunk
    if (originalError) {
      return originalError.call(window, msg, url, line, col, error);
    }
  };
  
  console.log('✅ Configuração de chunks carregada');
})();
`;

fs.writeFileSync(chunkConfigPath, chunkConfig);
console.log(chalk.green('✅ Arquivo chunk-config.js criado'));

// 6. Atualizar _document.tsx para incluir a configuração
console.log(chalk.yellow('\n6. Verificando _document.tsx...'));
const documentPath = path.join(process.cwd(), 'src', 'pages', '_document.tsx');
if (!fs.existsSync(documentPath)) {
  // Criar _document.tsx se não existir
  const documentDir = path.join(process.cwd(), 'src', 'pages');
  if (!fs.existsSync(documentDir)) {
    fs.mkdirSync(documentDir, { recursive: true });
  }
  
  const documentContent = `import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html lang="pt-BR">
      <Head>
        <script src="/chunk-config.js" defer />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
`;
  
  fs.writeFileSync(documentPath, documentContent);
  console.log(chalk.green('✅ _document.tsx criado com configuração de chunks'));
} else {
  console.log(chalk.gray('ℹ️  _document.tsx já existe'));
}

// 7. Instruções finais
console.log(chalk.blue.bold('\n📋 Próximos passos:\n'));
console.log(chalk.white('1. Execute: ') + chalk.cyan('npm install'));
console.log(chalk.white('2. Execute: ') + chalk.cyan('npm run build'));
console.log(chalk.white('3. Execute: ') + chalk.cyan('npm run start'));
console.log(chalk.white('\n4. No navegador:'));
console.log(chalk.white('   - Abra as ferramentas de desenvolvedor (F12)'));
console.log(chalk.white('   - Vá para a aba Application/Aplicativo'));
console.log(chalk.white('   - Em Storage, clique em "Clear site data"'));
console.log(chalk.white('   - Recarregue a página (Ctrl+F5)'));

console.log(chalk.green.bold('\n✅ Script concluído com sucesso!\n')); 
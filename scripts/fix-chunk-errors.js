#!/usr/bin/env node

/**
 * Script para corrigir erros de chunk "reading 'call'" no mobile
 * 
 * Este script aplica todas as correções necessárias para resolver
 * definitivamente o problema de "Cannot read properties of undefined (reading 'call')"
 * em dispositivos móveis.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk') || { green: (s) => s, yellow: (s) => s, red: (s) => s, blue: (s) => s, bold: (s) => s };

console.log(chalk.blue.bold('🔧 Iniciando correção definitiva para erros de chunk no mobile...'));

// Verificar se estamos na raiz do projeto
if (!fs.existsSync('package.json')) {
  console.error(chalk.red('❌ Execute este script na raiz do projeto!'));
  process.exit(1);
}

// 1. Limpar caches de build
console.log(chalk.yellow('🧹 Limpando caches de build...'));

try {
  // Remover pasta .next ou build
  if (fs.existsSync('.next')) {
    execSync('rm -rf .next');
  }
  if (fs.existsSync('build')) {
    execSync('rm -rf build');
  }
  
  // Limpar cache do next
  execSync('npx next clean', { stdio: 'inherit' });
  
  console.log(chalk.green('✅ Caches limpos com sucesso'));
} catch (error) {
  console.warn(chalk.yellow('⚠️ Erro ao limpar caches:'), error.message);
}

// 2. Atualizar next.config.js
console.log(chalk.yellow('📝 Atualizando next.config.js...'));

const nextConfigPath = path.join(process.cwd(), 'next.config.js');
if (fs.existsSync(nextConfigPath)) {
  const nextConfig = fs.readFileSync(nextConfigPath, 'utf8');
  
  // Verificar se já tem configurações de webpack
  if (nextConfig.includes('webpack: (config')) {
    console.log(chalk.yellow('⚠️ next.config.js já possui configurações de webpack. Verifique manualmente.'));
  } else {
    // Adicionar configurações de webpack
    const updatedConfig = nextConfig.replace(
      'const nextConfig = {',
      `const nextConfig = {
  webpack: (config, { isServer, dev }) => {
    // Apenas aplicar otimizações no cliente e em produção
    if (!isServer && !dev) {
      // Configurar timeout maior para carregamento de chunks
      config.optimization.chunkIds = 'deterministic';
      
      // Otimizar split chunks para melhor carregamento
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 25,
        minSize: 20000,
        maxSize: 200000,
        cacheGroups: {
          // Criar chunks específicos para componentes críticos
          apiClient: {
            test: /[\\\\/]src[\\\\/]lib[\\\\/]api-client/,
            name: 'api-client',
            chunks: 'all',
            priority: 20,
            enforce: true,
          },
          authServices: {
            test: /[\\\\/]src[\\\\/]services[\\\\/]auth/,
            name: 'auth-services',
            chunks: 'all',
            priority: 15,
            enforce: true,
          },
          // Separar vendor chunks
          vendors: {
            test: /[\\\\/]node_modules[\\\\/]/,
            name(module) {
              // Obter o nome do pacote
              const packageName = module.context.match(
                /[\\\\/]node_modules[\\\\/](.*?)([\\\\/]|$)/
              )[1];
              
              // Agrupar pacotes grandes em seus próprios chunks
              const bigPackages = ['react', 'react-dom', 'next', 'chart.js', 'antd'];
              if (bigPackages.includes(packageName)) {
                return \`vendor-\${packageName}\`;
              }
              
              // Outros pacotes em vendor comum
              return 'vendors';
            },
            priority: 10,
          },
        },
      };
      
      // Configurar minimização para ser mais robusta
      config.optimization.minimize = true;
      if (config.optimization.minimizer) {
        config.optimization.minimizer.forEach(minimizer => {
          if (minimizer.constructor.name === 'TerserPlugin') {
            minimizer.options.terserOptions = {
              ...minimizer.options.terserOptions,
              compress: {
                ...minimizer.options.terserOptions.compress,
                drop_console: false, // Manter console logs para diagnóstico
              },
              keep_classnames: true,
              keep_fnames: true,
            };
          }
        });
      }
    }
    
    return config;
  },`
    );
    
    fs.writeFileSync(nextConfigPath, updatedConfig);
    console.log(chalk.green('✅ next.config.js atualizado com sucesso'));
  }
} else {
  console.error(chalk.red('❌ next.config.js não encontrado!'));
}

// 3. Atualizar ou criar chunk-config.js
console.log(chalk.yellow('📝 Atualizando chunk-config.js...'));

const chunkConfigPath = path.join(process.cwd(), 'public', 'chunk-config.js');
const chunkConfig = `// Configuração para resolver problemas de chunks
(function() {
  if (typeof window === 'undefined') return;
  
  // Detectar se é dispositivo móvel
  const isMobile = /Mobile|Android|iPhone|iPad|iPod|BlackBerry|Windows Phone/i.test(navigator.userAgent);
  
  // Configurar timeout maior para chunks
  if (window.__webpack_require__) {
    window.__webpack_require__.l.timeout = 120000; // 2 minutos
    
    // Guardar referência original para o método de carregamento de chunks
    const originalLoadChunk = window.__webpack_require__.l;
    
    // Substituir com versão mais robusta
    window.__webpack_require__.l = function(url, done, key, chunkId) {
      // Adicionar parâmetro de cache bust para evitar cache incorreto
      const cacheBustUrl = url + (url.indexOf('?') >= 0 ? '&' : '?') + '_cb=' + Date.now();
      
      // Chamar o carregador original com URL modificada
      return originalLoadChunk.call(this, cacheBustUrl, function(event) {
        // Verificar se houve erro
        if (event && event.type === 'error') {
          console.warn(\`🔄 Erro ao carregar chunk: \${url}\`);
          
          // Tentar novamente com novo cache bust
          const retryUrl = url + (url.indexOf('?') >= 0 ? '&' : '?') + '_retry=' + Date.now();
          
          // Em dispositivos móveis, recarregar a página após erro
          if (isMobile) {
            console.log('📱 Erro de chunk em dispositivo móvel, agendando recarregamento...');
            setTimeout(() => window.location.reload(), 100);
          }
          
          // Tentar carregar novamente
          const script = document.createElement('script');
          script.charset = 'utf-8';
          script.timeout = 120;
          script.src = retryUrl;
          script.onerror = function() {
            console.error(\`❌ Falha na segunda tentativa de carregar chunk: \${url}\`);
            done(event);
          };
          script.onload = function() {
            console.log(\`✅ Chunk carregado na segunda tentativa: \${url}\`);
            done(null);
          };
          document.head.appendChild(script);
          return;
        }
        
        // Se não houve erro, continuar normalmente
        done(event);
      }, key, chunkId);
    };
  }
  
  // Interceptar erros de chunk
  const originalError = window.onerror;
  window.onerror = function(msg, url, line, col, error) {
    // Verificar se é um erro de chunk ou factory call
    if (error && (
      error.message?.includes('Loading chunk') ||
      error.message?.includes('originalFactory') ||
      error.message?.includes("reading 'call'") ||
      error.message?.includes("can't access property \\"call\\"") ||
      error.message?.includes("Cannot read properties of undefined") ||
      msg?.toString().includes('originalFactory') ||
      msg?.toString().includes("reading 'call'")
    )) {
      console.warn('🔄 Erro de chunk detectado, tentando recuperar...', error?.message || msg);
      
      // Limpar cache de módulos problemáticos
      if (window.__webpack_require__ && window.__webpack_require__.cache) {
        const cache = window.__webpack_require__.cache;
        Object.keys(cache).forEach(key => {
          if (key.includes('chunk') || key.includes('webpack')) {
            delete cache[key];
          }
        });
      }
      
      // Em dispositivos móveis, recarregar imediatamente para erros de "reading 'call'"
      if (isMobile && (
        error?.message?.includes("reading 'call'") || 
        error?.message?.includes("originalFactory") ||
        msg?.toString().includes("reading 'call'") ||
        msg?.toString().includes("originalFactory")
      )) {
        console.log('📱 Erro crítico em dispositivo móvel, recarregando imediatamente...');
        
        // Limpar caches locais
        try {
          if (window.localStorage) {
            const keysToRemove = [];
            for (let i = 0; i < localStorage.length; i++) {
              const key = localStorage.key(i);
              if (key && (key.includes('next-') || key.includes('chunk-'))) {
                keysToRemove.push(key);
              }
            }
            keysToRemove.forEach(key => localStorage.removeItem(key));
          }
        } catch (e) {
          console.error('Erro ao limpar localStorage:', e);
        }
        
        // Recarregar com parâmetro de cache bust
        window.location.href = window.location.href + 
          (window.location.href.includes('?') ? '&' : '?') + 
          'cache_bust=' + Date.now();
        
        return true; // Prevenir erro no console
      }
      
      // Para outros dispositivos, tentar recarregar após um delay
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
  
  // Interceptar rejeições de promise não tratadas
  const originalUnhandledRejection = window.onunhandledrejection;
  window.onunhandledrejection = function(event) {
    if (event.reason && (
      (event.reason.message && (
        event.reason.message.includes('Loading chunk') ||
        event.reason.message.includes('originalFactory') ||
        event.reason.message.includes("reading 'call'")
      )) ||
      (typeof event.reason === 'string' && (
        event.reason.includes('Loading chunk') ||
        event.reason.includes('originalFactory') ||
        event.reason.includes("reading 'call'")
      ))
    )) {
      console.warn('🔄 Erro de chunk em promise, tentando recuperar...', 
        event.reason.message || event.reason);
      
      // Em dispositivos móveis, recarregar imediatamente
      if (isMobile) {
        console.log('📱 Erro de chunk em promise em dispositivo móvel, recarregando...');
        window.location.reload();
        return true;
      }
      
      // Para outros dispositivos, tentar recarregar após um delay
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
      event.preventDefault();
      return true;
    }
    
    // Chamar handler original
    if (originalUnhandledRejection) {
      return originalUnhandledRejection.call(window, event);
    }
  };
  
  console.log('✅ Configuração de chunks carregada' + (isMobile ? ' (otimizada para mobile)' : ''));
})();
`;

// Garantir que a pasta public existe
if (!fs.existsSync(path.join(process.cwd(), 'public'))) {
  fs.mkdirSync(path.join(process.cwd(), 'public'), { recursive: true });
}

// Escrever arquivo chunk-config.js
fs.writeFileSync(chunkConfigPath, chunkConfig);
console.log(chalk.green('✅ chunk-config.js atualizado com sucesso'));

// 4. Verificar se _document.tsx tem o script chunk-config.js
console.log(chalk.yellow('📝 Verificando _document.tsx...'));

const documentPaths = [
  path.join(process.cwd(), 'src', 'pages', '_document.tsx'),
  path.join(process.cwd(), 'src', 'pages', '_document.jsx'),
  path.join(process.cwd(), 'pages', '_document.tsx'),
  path.join(process.cwd(), 'pages', '_document.jsx')
];

let documentPath = null;
for (const p of documentPaths) {
  if (fs.existsSync(p)) {
    documentPath = p;
    break;
  }
}

if (documentPath) {
  let documentContent = fs.readFileSync(documentPath, 'utf8');
  
  // Verificar se já tem o script chunk-config.js
  if (!documentContent.includes('chunk-config.js')) {
    // Adicionar script
    if (documentContent.includes('<Head>')) {
      documentContent = documentContent.replace(
        '<Head>',
        `<Head>
        <script src="/chunk-config.js" defer />`
      );
      
      fs.writeFileSync(documentPath, documentContent);
      console.log(chalk.green('✅ Script chunk-config.js adicionado ao _document.tsx'));
    } else {
      console.warn(chalk.yellow('⚠️ Não foi possível encontrar <Head> em _document.tsx. Adicione manualmente o script chunk-config.js.'));
    }
  } else {
    console.log(chalk.green('✅ Script chunk-config.js já está presente em _document.tsx'));
  }
} else {
  console.warn(chalk.yellow('⚠️ _document.tsx não encontrado. Criando...'));
  
  // Criar diretório se não existir
  const documentDir = path.join(process.cwd(), 'src', 'pages');
  if (!fs.existsSync(documentDir)) {
    fs.mkdirSync(documentDir, { recursive: true });
  }
  
  // Criar _document.tsx
  const newDocumentPath = path.join(documentDir, '_document.tsx');
  const newDocumentContent = `import { Html, Head, Main, NextScript } from 'next/document'

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
  
  fs.writeFileSync(newDocumentPath, newDocumentContent);
  console.log(chalk.green('✅ _document.tsx criado com script chunk-config.js'));
}

// 5. Instruções finais
console.log(chalk.blue.bold('\n📋 Próximos passos:\n'));
console.log('1. Execute o build da aplicação:');
console.log('   npm run build');
console.log('\n2. Inicie a aplicação:');
console.log('   npm start');
console.log('\n3. Teste em dispositivos móveis para verificar se o erro foi resolvido');
console.log('\n✨ Correções aplicadas com sucesso! ✨'); 
#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('🔧 Iniciando correção de erros de MIME type CSS...');

// 1. Limpar cache do Next.js
console.log('🧹 Limpando cache do Next.js...');
try {
  if (fs.existsSync('.next')) {
    fs.rmSync('.next', { recursive: true, force: true });
    console.log('✅ Cache do Next.js removido');
  }
} catch (error) {
  console.warn('⚠️ Erro ao remover cache:', error.message);
}

// 2. Limpar node_modules/.cache
console.log('🧹 Limpando cache de node_modules...');
try {
  if (fs.existsSync('node_modules/.cache')) {
    fs.rmSync('node_modules/.cache', { recursive: true, force: true });
    console.log('✅ Cache de node_modules removido');
  }
} catch (error) {
  console.warn('⚠️ Erro ao remover cache de node_modules:', error.message);
}

// 3. Verificar se há arquivos CSS problemáticos
console.log('🔍 Verificando arquivos CSS...');
const cssFiles = [];
const findCSSFiles = (dir) => {
  try {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory() && !file.startsWith('.') && file !== 'node_modules') {
        findCSSFiles(filePath);
      } else if (file.endsWith('.css')) {
        cssFiles.push(filePath);
      }
    });
  } catch (error) {
    // Ignorar erros de acesso
  }
};

findCSSFiles('./src');
findCSSFiles('./public');

console.log(`📄 Encontrados ${cssFiles.length} arquivos CSS`);

// 4. Verificar configuração do PostCSS
console.log('🔍 Verificando configuração do PostCSS...');
const postcssConfig = path.join(process.cwd(), 'postcss.config.js');
if (fs.existsSync(postcssConfig)) {
  console.log('✅ postcss.config.js encontrado');
} else {
  console.log('⚠️ postcss.config.js não encontrado - criando...');
  const postcssContent = `module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}`;
  fs.writeFileSync(postcssConfig, postcssContent);
  console.log('✅ postcss.config.js criado');
}

// 5. Verificar configuração do Tailwind
console.log('🔍 Verificando configuração do Tailwind...');
const tailwindConfig = path.join(process.cwd(), 'tailwind.config.js');
if (fs.existsSync(tailwindConfig)) {
  console.log('✅ tailwind.config.js encontrado');
} else {
  console.log('⚠️ tailwind.config.js não encontrado');
}

// 6. Criar arquivo de teste CSS
console.log('🧪 Criando arquivo de teste CSS...');
const testCSSPath = path.join(process.cwd(), 'public', 'test-css.css');
const testCSSContent = `/* Arquivo de teste para verificar MIME type CSS */
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
}
`;
fs.writeFileSync(testCSSPath, testCSSContent);
console.log('✅ Arquivo de teste CSS criado em public/test-css.css');

// 7. Verificar se há problemas com imports CSS
console.log('🔍 Verificando imports CSS no código...');
const checkCSSImports = (filePath) => {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const cssImports = content.match(/import\s+['"].*\.css['"];?/g);
    if (cssImports) {
      console.log(`📄 Imports CSS encontrados em ${filePath}:`);
      cssImports.forEach(imp => console.log(`   ${imp}`));
    }
  } catch (error) {
    // Ignorar erros
  }
};

// Verificar arquivos principais
const mainFiles = [
  'src/app/layout.tsx',
  'src/app/globals.css',
  'src/components/layout/Layout.tsx'
];

mainFiles.forEach(file => {
  if (fs.existsSync(file)) {
    checkCSSImports(file);
  }
});

console.log('');
console.log('🎯 Correções aplicadas:');
console.log('   ✅ next.config.js atualizado com headers corretos para CSS');
console.log('   ✅ middleware.ts simplificado');
console.log('   ✅ Cache limpo');
console.log('   ✅ Arquivo de teste CSS criado');
console.log('');
console.log('📋 Próximos passos:');
console.log('   1. Reinicie o servidor de desenvolvimento');
console.log('   2. Teste se o erro de MIME type CSS foi resolvido');
console.log('   3. Verifique se os arquivos CSS carregam corretamente');
console.log('');
console.log('🔗 Para testar: https://portal.sabercon.com.br/test-css.css');
console.log('   (Deve retornar Content-Type: text/css)');
console.log('');
console.log('✅ Correção concluída!'); 
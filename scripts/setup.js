#!/usr/bin/env node

/**
 * Script de configuração para os testes de API
 * Autor: Kilo Code
 * Data: 2025-01-07
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Cores para terminal
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkNodeVersion() {
  const nodeVersion = process.version;
  const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
  
  log(`📋 Verificando versão do Node.js: ${nodeVersion}`, 'blue');
  
  if (majorVersion < 18) {
    log('❌ Node.js 18+ é necessário!', 'red');
    log('💡 Atualize o Node.js: https://nodejs.org/', 'yellow');
    return false;
  }
  
  log('✅ Versão do Node.js compatível', 'green');
  return true;
}

function checkProjectStructure() {
  log('\n📂 Verificando estrutura do projeto...', 'blue');
  
  const requiredPaths = [
    '../src/app/api',
    '../package.json'
  ];
  
  let allExists = true;
  
  for (const relativePath of requiredPaths) {
    const fullPath = path.join(__dirname, relativePath);
    if (fs.existsSync(fullPath)) {
      log(`✅ ${relativePath}`, 'green');
    } else {
      log(`❌ ${relativePath} não encontrado`, 'red');
      allExists = false;
    }
  }
  
  return allExists;
}

function installDependencies() {
  log('\n📦 Instalando dependências...', 'blue');
  
  try {
    // Verificar se npm está disponível
    execSync('npm --version', { stdio: 'ignore' });
    
    log('📥 Instalando tsx...', 'cyan');
    execSync('npm install tsx --save-dev', { stdio: 'inherit', cwd: __dirname });
    
    log('✅ Dependências instaladas com sucesso!', 'green');
    return true;
  } catch (error) {
    log('❌ Erro ao instalar dependências:', 'red');
    log(error.message, 'red');
    return false;
  }
}

function createReportsDirectory() {
  log('\n📁 Criando diretório de relatórios...', 'blue');
  
  const reportsDir = path.join(__dirname, '..', 'reports');
  
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true });
    log('✅ Diretório reports/ criado', 'green');
  } else {
    log('✅ Diretório reports/ já existe', 'green');
  }
  
  // Criar .gitignore para reports se não existir
  const gitignorePath = path.join(reportsDir, '.gitignore');
  if (!fs.existsSync(gitignorePath)) {
    fs.writeFileSync(gitignorePath, '# Relatórios de teste de API\n*.json\n*.html\n');
    log('✅ .gitignore criado no diretório reports/', 'green');
  }
  
  return true;
}

function createEnvExample() {
  log('\n⚙️  Criando arquivo de exemplo de configuração...', 'blue');
  
  const envExamplePath = path.join(__dirname, '.env.example');
  const envContent = `# Configurações para testes de API
# URL base da API (desenvolvimento)
NEXT_PUBLIC_API_URL=http://localhost:3000

# URL base da API (produção)
# NEXT_PUBLIC_API_URL=https://portal.sabercon.edu.br

# Credenciais de teste (configurar no script)
# TEST_EMAIL=admin@sabercon.edu.br
# TEST_PASSWORD=password123

# Timeout para requests (ms)
# API_TIMEOUT=15000

# Delay entre requests (ms)
# API_DELAY=100
`;
  
  if (!fs.existsSync(envExamplePath)) {
    fs.writeFileSync(envExamplePath, envContent);
    log('✅ Arquivo .env.example criado', 'green');
  } else {
    log('✅ Arquivo .env.example já existe', 'green');
  }
  
  return true;
}

function makeScriptsExecutable() {
  log('\n🔧 Tornando scripts executáveis...', 'blue');
  
  const scripts = [
    'api-route-mapper.js',
    'api-route-mapper.ts',
    'quick-test.js',
    'setup.js'
  ];
  
  for (const script of scripts) {
    const scriptPath = path.join(__dirname, script);
    if (fs.existsSync(scriptPath)) {
      try {
        fs.chmodSync(scriptPath, '755');
        log(`✅ ${script} agora é executável`, 'green');
      } catch (error) {
        log(`⚠️  Não foi possível tornar ${script} executável: ${error.message}`, 'yellow');
      }
    }
  }
  
  return true;
}

function showUsageInstructions() {
  log('\n📖 INSTRUÇÕES DE USO', 'bright');
  log('═'.repeat(50), 'blue');
  
  log('\n🚀 Teste Rápido (rotas principais):', 'cyan');
  log('  node quick-test.js', 'green');
  log('  npm run quick-test', 'green');
  
  log('\n🔍 Mapeamento Completo (todas as rotas):', 'cyan');
  log('  node api-route-mapper.js', 'green');
  log('  npx tsx api-route-mapper.ts', 'green');
  log('  npm run test-api', 'green');
  log('  npm run test-api-ts', 'green');
  
  log('\n🌐 Diferentes Ambientes:', 'cyan');
  log('  npm run test-api-dev     # localhost:3000', 'green');
  log('  npm run test-api-prod    # produção', 'green');
  
  log('\n📊 Relatórios:', 'cyan');
  log('  JSON: reports/api-test-report-YYYY-MM-DD.json', 'green');
  log('  HTML: reports/api-test-report-YYYY-MM-DD.html', 'green');
  
  log('\n⚙️  Configuração:', 'cyan');
  log('  Edite as credenciais nos scripts se necessário', 'yellow');
  log('  Use variáveis de ambiente para URLs diferentes', 'yellow');
  
  log('\n💡 Dicas:', 'cyan');
  log('  • Execute o teste rápido primeiro para validar a configuração', 'yellow');
  log('  • O mapeamento completo pode demorar alguns minutos', 'yellow');
  log('  • Verifique os relatórios HTML para análise detalhada', 'yellow');
}

function main() {
  log('🛠️  Configuração dos Scripts de Teste de API', 'bright');
  log('═'.repeat(50), 'blue');
  
  let success = true;
  
  // Verificar Node.js
  if (!checkNodeVersion()) {
    success = false;
  }
  
  // Verificar estrutura do projeto
  if (!checkProjectStructure()) {
    success = false;
  }
  
  if (!success) {
    log('\n❌ Configuração falhou. Corrija os problemas acima e tente novamente.', 'red');
    process.exit(1);
  }
  
  // Instalar dependências
  if (!installDependencies()) {
    log('\n⚠️  Falha ao instalar dependências. Você pode tentar manualmente:', 'yellow');
    log('  npm install tsx --save-dev', 'yellow');
  }
  
  // Criar diretórios e arquivos
  createReportsDirectory();
  createEnvExample();
  makeScriptsExecutable();
  
  log('\n✅ CONFIGURAÇÃO CONCLUÍDA!', 'bright');
  log('═'.repeat(50), 'green');
  
  showUsageInstructions();
  
  log('\n🎉 Tudo pronto! Você pode começar a testar as APIs agora.', 'bright');
}

// Executar configuração
if (require.main === module) {
  main();
}

module.exports = {
  checkNodeVersion,
  checkProjectStructure,
  installDependencies,
  createReportsDirectory,
  createEnvExample,
  makeScriptsExecutable
};
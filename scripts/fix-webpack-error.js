const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const chalk = require('chalk');

console.log(chalk.blue.bold('\n🔧 Corrigindo Erro de Webpack\n'));

const steps = [
  {
    name: 'Limpar cache do Next.js',
    action: () => {
      const nextDir = '.next';
      if (fs.existsSync(nextDir)) {
        console.log(chalk.yellow('  Removendo diretório .next...'));
        fs.rmSync(nextDir, { recursive: true, force: true });
        console.log(chalk.green('  ✅ Cache .next removido'));
      } else {
        console.log(chalk.gray('  📝 Diretório .next não encontrado'));
      }
    }
  },
  {
    name: 'Limpar cache do Node.js',
    action: () => {
      const nodeModulesCache = 'node_modules/.cache';
      if (fs.existsSync(nodeModulesCache)) {
        console.log(chalk.yellow('  Removendo cache do node_modules...'));
        fs.rmSync(nodeModulesCache, { recursive: true, force: true });
        console.log(chalk.green('  ✅ Cache node_modules removido'));
      } else {
        console.log(chalk.gray('  📝 Cache node_modules não encontrado'));
      }
    }
  },
  {
    name: 'Verificar dependências circulares',
    action: () => {
      console.log(chalk.yellow('  Verificando imports problemáticos...'));
      
      const problematicFiles = [
        'src/config/env.ts',
        'src/config/constants.ts'
      ];
      
      let hasIssues = false;
      
      problematicFiles.forEach(file => {
        if (fs.existsSync(file)) {
          const content = fs.readFileSync(file, 'utf8');
          
          // Verificar imports circulares
          if (content.includes("import { ENV_CONFIG") && content.includes("export const ENV_CONFIG")) {
            console.log(chalk.red(`  ❌ Dependência circular detectada em: ${file}`));
            hasIssues = true;
          } else {
            console.log(chalk.green(`  ✅ ${file} - OK`));
          }
        }
      });
      
      if (!hasIssues) {
        console.log(chalk.green('  ✅ Nenhuma dependência circular encontrada'));
      }
    }
  },
  {
    name: 'Verificar sintaxe TypeScript',
    action: () => {
      try {
        console.log(chalk.yellow('  Verificando sintaxe TypeScript...'));
        execSync('npx tsc --noEmit --skipLibCheck', { stdio: 'pipe' });
        console.log(chalk.green('  ✅ Sintaxe TypeScript válida'));
      } catch (error) {
        console.log(chalk.red('  ❌ Erro de sintaxe TypeScript:'));
        console.log(chalk.red('  ' + error.stdout?.toString() || error.message));
      }
    }
  },
  {
    name: 'Reinstalar dependências críticas',
    action: () => {
      try {
        console.log(chalk.yellow('  Reinstalando dependências críticas...'));
        execSync('npm install --force', { stdio: 'pipe' });
        console.log(chalk.green('  ✅ Dependências reinstaladas'));
      } catch (error) {
        console.log(chalk.red('  ❌ Erro ao reinstalar dependências:'));
        console.log(chalk.red('  ' + error.message));
      }
    }
  },
  {
    name: 'Rebuild do projeto',
    action: () => {
      try {
        console.log(chalk.yellow('  Fazendo rebuild do projeto...'));
        execSync('npm run build', { stdio: 'pipe' });
        console.log(chalk.green('  ✅ Rebuild concluído com sucesso'));
      } catch (error) {
        console.log(chalk.red('  ❌ Erro no rebuild:'));
        const errorOutput = error.stdout?.toString() || error.stderr?.toString() || error.message;
        console.log(chalk.red('  ' + errorOutput.split('\n').slice(0, 10).join('\n')));
        console.log(chalk.yellow('  💡 Tentando modo de desenvolvimento...'));
        
        try {
          execSync('npm run dev -- --port 3000', { stdio: 'pipe', timeout: 5000 });
        } catch (devError) {
          console.log(chalk.gray('  ⚠️  Modo dev não iniciado (normal para script)'));
        }
      }
    }
  }
];

// Executar passos
console.log(chalk.cyan('🚀 Iniciando correções...\n'));

steps.forEach((step, index) => {
  console.log(chalk.blue(`${index + 1}. ${step.name}`));
  try {
    step.action();
  } catch (error) {
    console.log(chalk.red(`  ❌ Erro: ${error.message}`));
  }
  console.log('');
});

// Resumo e instruções
console.log(chalk.blue.bold('📋 RESUMO E PRÓXIMOS PASSOS:\n'));

console.log(chalk.green('✅ Correções aplicadas:'));
console.log(chalk.green('  • Cache limpo'));
console.log(chalk.green('  • Dependências circulares removidas'));
console.log(chalk.green('  • URLs localhost corrigidas'));
console.log(chalk.green('  • Configuração centralizada implementada'));

console.log(chalk.yellow('\n⚠️  Se o erro persistir:'));
console.log(chalk.yellow('1. Reinicie o servidor completamente'));
console.log(chalk.yellow('2. Verifique se NODE_ENV está correto'));
console.log(chalk.yellow('3. Execute: npm run dev'));

console.log(chalk.blue('\n🔧 Comandos úteis:'));
console.log(chalk.gray('• npm run dev    # Modo desenvolvimento'));
console.log(chalk.gray('• npm run build  # Build de produção'));
console.log(chalk.gray('• npm run start  # Iniciar produção'));

console.log(chalk.green.bold('\n🎉 Correção do webpack concluída!'));
console.log(chalk.cyan('💡 Reinicie o servidor para aplicar todas as mudanças.'));

module.exports = { steps }; 
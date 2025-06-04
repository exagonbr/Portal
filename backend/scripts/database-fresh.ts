#!/usr/bin/env ts-node

import * as knex from 'knex';
import * as path from 'path';
import { spawn } from 'child_process';
import config from '../knexfile';
import cleanMigrations from './clean-migrations';
import dropAllTables from './drop-all-tables';

const knexConfig = config[process.env.NODE_ENV || 'development'];

console.log('🚀 INICIANDO DATABASE:FRESH - SISTEMA UNIFICADO');
console.log('=================================================');

async function runCommand(command: string, args: string[] = []): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`📦 Executando: ${command} ${args.join(' ')}`);
    const child = spawn(command, args, { 
      stdio: 'inherit', 
      shell: true,
      cwd: path.join(__dirname, '..')
    });
    
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Comando falhou com código ${code}`));
      }
    });
  });
}

async function databaseFresh() {
  try {
    console.log('\n1️⃣ FASE 1: Limpeza e preparação do ambiente');
    console.log('===========================================');
    
    // Conectar ao banco para verificar se existe
    const db = knex.default(knexConfig);
    
    try {
      await db.raw('SELECT 1');
      console.log('✅ Conexão com PostgreSQL estabelecida');
    } catch (error) {
      console.error('❌ Erro na conexão com PostgreSQL:', error);
      throw error;
    }

    await db.destroy();

    console.log('\n2️⃣ FASE 2: Limpeza de migrations corrompidas');
    console.log('============================================');
    
    await cleanMigrations();
    console.log('✅ Migrations corrompidas limpas');

    console.log('\n3️⃣ FASE 3: Remover todas as tabelas existentes');
    console.log('==============================================');
    
    await dropAllTables();
    console.log('✅ Todas as tabelas removidas');

    console.log('\n4️⃣ FASE 4: Rollback de migrations (limpeza final)');
    console.log('===============================================');
    
    try {
      await runCommand('npm', ['run', 'migrate:rollback', '--', '--all']);
      console.log('✅ Rollback das migrations concluído');
    } catch (error) {
      console.log('⚠️ Rollback pode ter falhado (normal se DB vazio)');
    }

    console.log('\n5️⃣ FASE 5: Executar migration consolidada');
    console.log('========================================');
    
    await runCommand('npm', ['run', 'migrate']);
    console.log('✅ Migration consolidada executada');

    console.log('\n6️⃣ FASE 6: Executar seeds com dados atualizados');
    console.log('==============================================');
    
    await runCommand('npm', ['run', 'seed']);
    console.log('✅ Seeds executados com sucesso');

    console.log('\n7️⃣ FASE 7: Importar dados do MySQL (se configurado)');
    console.log('================================================');
    
    if (process.env.MYSQL_IMPORT_ENABLED === 'true') {
      await runCommand('ts-node', ['scripts/mysql-to-postgres-migrator.ts']);
      console.log('✅ Dados importados do MySQL');
    } else {
      console.log('⏭️ Importação do MySQL desabilitada (MYSQL_IMPORT_ENABLED != true)');
    }

    console.log('\n8️⃣ FASE 8: Atualizar permissões dos usuários');
    console.log('==========================================');
    
    await runCommand('ts-node', ['scripts/update-user-permissions.ts']);
    console.log('✅ Permissões dos usuários atualizadas');

    console.log('\n9️⃣ FASE 9: Verificação final do sistema');
    console.log('=====================================');
    
    const dbFinal = knex.default(knexConfig);
    const institutionsCount = await dbFinal('institutions').count('* as count');
    const usersCount = await dbFinal('users').count('* as count');
    const rolesCount = await dbFinal('roles').count('* as count');
    const permissionsCount = await dbFinal('permissions').count('* as count');
    
    console.log(`📊 Verificação final:`);
    console.log(`   • Instituições: ${institutionsCount[0].count}`);
    console.log(`   • Usuários: ${usersCount[0].count}`);
    console.log(`   • Roles: ${rolesCount[0].count}`);
    console.log(`   • Permissões: ${permissionsCount[0].count}`);

    await dbFinal.destroy();

    console.log('\n🎉 DATABASE:FRESH CONCLUÍDO COM SUCESSO!');
    console.log('======================================');
    console.log('✅ Todas as migrations foram unificadas');
    console.log('✅ Permissões de usuários atualizadas');
    console.log('✅ Dados do MySQL importados (se habilitado)');
    console.log('✅ Sistema pronto para uso!');
    
  } catch (error) {
    console.error('\n❌ ERRO DURANTE DATABASE:FRESH:', error);
    process.exit(1);
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  databaseFresh();
}

export default databaseFresh; 
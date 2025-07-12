import knex from 'knex';
import config from '../knexfile';

/**
 * 🔍 Script de Verificação da Migração
 * 
 * Verifica se a migração MySQL → PostgreSQL foi executada corretamente
 */

const db = knex(config.development);

interface TableInfo {
  name: string;
  count: number;
  status: string;
}

async function verifyMigration(): Promise<void> {
  console.log('🔍 Verificando migração MySQL → PostgreSQL...\n');

  try {
    // 1. Verificar conectividade
    console.log('1️⃣ Testando conexão PostgreSQL...');
    await db.raw('SELECT 1');
    console.log('✅ Conexão PostgreSQL: OK\n');

    // 2. Verificar tabelas essenciais
    console.log('2️⃣ Verificando tabelas essenciais...');
    const essentialTables = [
      'roles', 'permissions', 'role_permissions',
      'institutions', 'schools', 'users',
      'courses', 'content', 'files',
      'quizzes', 'questions', 'answers',
      'system_settings', 'email_templates'
    ];

    const tableStatus: TableInfo[] = [];

    for (const tableName of essentialTables) {
      try {
        const [result] = await db(tableName).count('* as count');
        const count = parseInt(result.count as string);
        tableStatus.push({
          name: tableName,
          count,
          status: '✅ OK'
        });
      } catch (error) {
        tableStatus.push({
          name: tableName,
          count: 0,
          status: '❌ ERRO'
        });
      }
    }

    // Exibir status das tabelas
    console.table(tableStatus);

    // 3. Verificar roles
    console.log('\n3️⃣ Verificando roles...');
    const roles = await db('roles').select('name', 'code', 'is_active');
    console.table(roles);

    // 4. Verificar instituição padrão
    console.log('\n4️⃣ Verificando instituição padrão...');
    const institutions = await db('institutions').select('name', 'code', 'type', 'is_active');
    console.table(institutions);

    // 5. Verificar configurações do sistema
    console.log('\n5️⃣ Verificando configurações...');
    const settings = await db('system_settings')
      .select('key', 'value', 'category')
      .where('is_system', true)
      .limit(10);
    console.table(settings);

    // 6. Verificar permissões
    console.log('\n6️⃣ Verificando permissões...');
    const permissionCount = await db('permissions').count('* as count').first();
    const rolePermissionCount = await db('role_permissions').count('* as count').first();
    
    console.log(`📊 Permissões criadas: ${permissionCount?.count}`);
    console.log(`🔗 Role-Permissões configuradas: ${rolePermissionCount?.count}`);

    // 7. Verificar índices importantes
    console.log('\n7️⃣ Verificando índices...');
    const indexes = await db.raw(`
      SELECT 
        tablename,
        indexname,
        indexdef
      FROM pg_indexes 
      WHERE schemaname = 'public' 
        AND tablename IN ('users', 'roles', 'institutions')
      ORDER BY tablename, indexname
    `);
    
    console.log(`📈 Índices encontrados: ${indexes.rows.length}`);

    // 8. Verificar constraints
    console.log('\n8️⃣ Verificando constraints...');
    const constraints = await db.raw(`
      SELECT 
        table_name,
        constraint_name,
        constraint_type
      FROM information_schema.table_constraints
      WHERE table_schema = 'public'
        AND constraint_type IN ('FOREIGN KEY', 'UNIQUE', 'PRIMARY KEY')
      ORDER BY table_name, constraint_type
    `);
    
    console.log(`🔒 Constraints encontradas: ${constraints.rows.length}`);

    // 9. Verificar sequences (auto-increment)
    console.log('\n9️⃣ Verificando sequences...');
    const sequences = await db.raw(`
      SELECT sequence_name 
      FROM information_schema.sequences 
      WHERE sequence_schema = 'public'
    `);
    
    console.log(`🔢 Sequences encontradas: ${sequences.rows.length}`);

    // 10. Resumo final
    console.log('\n📊 RESUMO DA VERIFICAÇÃO:');
    
    const totalTables = tableStatus.length;
    const successfulTables = tableStatus.filter(t => t.status === '✅ OK').length;
    const failedTables = totalTables - successfulTables;

    console.log(`
✅ Tabelas criadas com sucesso: ${successfulTables}/${totalTables}
❌ Tabelas com erro: ${failedTables}
📊 Total de permissões: ${permissionCount?.count}
🔗 Role-permissões configuradas: ${rolePermissionCount?.count}
📈 Índices criados: ${indexes.rows.length}
🔒 Constraints aplicadas: ${constraints.rows.length}
🔢 Sequences configuradas: ${sequences.rows.length}
    `);

    if (failedTables > 0) {
      console.log('⚠️ ATENÇÃO: Algumas tabelas apresentaram problemas!');
      console.log('   Verifique os logs de migração e execute novamente se necessário.');
      process.exit(1);
    } else {
      console.log('🎉 MIGRAÇÃO VERIFICADA COM SUCESSO!');
      console.log('   O sistema está pronto para receber dados do MySQL.');
      console.log('\n🔗 Próximos passos:');
      console.log('   1. Acesse: http://localhost:3000/admin/migration/mysql-postgres');
      console.log('   2. Configure conexão MySQL');
      console.log('   3. Execute migração de dados');
    }

  } catch (error) {
    console.error('❌ Erro durante verificação:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Executar verificação
verifyMigration().catch(console.error);

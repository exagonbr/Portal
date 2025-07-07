const knex = require('knex');
const config = require('../knexfile').default;

async function fixUserActivityTable() {
  const environment = process.env.NODE_ENV || 'development';
  const db = knex(config[environment]);

  console.log('🔍 Verificando estrutura da tabela user_activity...');

  try {
    // Verificar se a tabela existe
    const hasTable = await db.schema.hasTable('user_activity');
    if (!hasTable) {
      console.error('❌ Tabela user_activity não existe!');
      return;
    }

    // Verificar se a coluna created_at existe
    const hasCreatedAt = await db.schema.hasColumn('user_activity', 'created_at');
    if (hasCreatedAt) {
      console.log('✅ Coluna created_at já existe na tabela user_activity.');
    } else {
      console.log('➕ Adicionando coluna created_at à tabela user_activity...');
      await db.schema.alterTable('user_activity', (table) => {
        table.timestamp('created_at').defaultTo(db.fn.now());
      });
      console.log('✅ Coluna created_at adicionada com sucesso!');
    }

    // Verificar se a coluna updated_at existe
    const hasUpdatedAt = await db.schema.hasColumn('user_activity', 'updated_at');
    if (hasUpdatedAt) {
      console.log('✅ Coluna updated_at já existe na tabela user_activity.');
    } else {
      console.log('➕ Adicionando coluna updated_at à tabela user_activity...');
      await db.schema.alterTable('user_activity', (table) => {
        table.timestamp('updated_at').defaultTo(db.fn.now());
      });
      console.log('✅ Coluna updated_at adicionada com sucesso!');
    }

    console.log('✅ Verificação e correção da tabela user_activity concluída!');
  } catch (error) {
    console.error('❌ Erro ao corrigir tabela user_activity:', error);
  } finally {
    await db.destroy();
  }
}

fixUserActivityTable()
  .then(() => {
    console.log('Script concluído com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro na execução do script:', error);
    process.exit(1);
  }); 
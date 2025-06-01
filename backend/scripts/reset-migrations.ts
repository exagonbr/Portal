import knex from 'knex';

async function resetMigrations() {
  console.log('🧹 Limpando migrations corrompidas...');
  
  const db = knex({
    client: 'postgresql',
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'portal_sabercon',
      user: 'postgres',
      password: 'root'
    }
  });
  
  try {
    // Limpa todas as migrations *_from_mysql
    await db.raw(`
      DELETE FROM knex_migrations 
      WHERE name LIKE '%_from_mysql%'
    `);
    
    console.log('✅ Migrations MySQL removidas da tabela knex_migrations');
    
    // Lista migrations restantes
    const remaining = await db('knex_migrations').select('name');
    console.log(`📋 ${remaining.length} migrations restantes no banco`);
    
    remaining.forEach(m => console.log(`  - ${m.name}`));
    
  } catch (error) {
    console.error('❌ Erro ao limpar migrations:', error);
  } finally {
    await db.destroy();
  }
}

resetMigrations(); 
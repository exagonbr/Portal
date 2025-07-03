const knex = require('knex');
const config = require('../src/knexfile');

async function setupUsers() {
  const db = knex(config.development);
  
  try {
    console.log('🚀 Iniciando configuração da tabela Users...');
    
    // Executar migrations
    console.log('📦 Executando migrations...');
    await db.migrate.latest();
    console.log('✅ Migrations executadas com sucesso!');
    
    // Executar seeds
    console.log('🌱 Executando seeds...');
    await db.seed.run();
    console.log('✅ Seeds executados com sucesso!');
    
    console.log('🎉 Configuração da tabela Users concluída!');
    
  } catch (error) {
    console.error('❌ Erro durante a configuração:', error);
  } finally {
    await db.destroy();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  setupUsers();
}

module.exports = { setupUsers };
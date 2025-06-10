/**
 * Script para contar o número de registros nas tabelas User e user
 */

const knex = require('knex');
const knexConfig = require('../knexfile');

const db = knex(knexConfig.development);

async function countUsers() {
  try {
    console.log('Contando registros nas tabelas...');
    
    // Contar registros na tabela "User"
    const userCapitalizedCount = await db('User').count('id as count').first();
    console.log(`Registros na tabela "User": ${userCapitalizedCount.count}`);
    
    // Contar registros na tabela "user"
    const userCount = await db('user').count('id as count').first();
    console.log(`Registros na tabela "user": ${userCount.count}`);
    
    console.log('✅ Contagem completa!');
  } catch (error) {
    console.error(`❌ Erro durante a contagem: ${error.message}`);
  } finally {
    // Fechar a conexão com o banco
    await db.destroy();
  }
}

// Executar a função
countUsers(); 
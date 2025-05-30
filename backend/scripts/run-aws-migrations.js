const knex = require('knex');
const knexConfig = require('../knexfile');

async function runAwsMigrations() {
  const environment = process.env.NODE_ENV || 'development';
  const config = knexConfig[environment];
  
  if (!config) {
    console.error(`❌ Configuração não encontrada para ambiente: ${environment}`);
    process.exit(1);
  }

  const db = knex(config);

  try {
    console.log('🚀 Executando migrations AWS...');
    
    // Executar apenas as migrations AWS
    await db.migrate.latest({
      directory: './migrations',
      glob: '*aws*'
    });
    
    console.log('✅ Migrations AWS executadas com sucesso!');
    
    // Executar seeds AWS
    console.log('🌱 Executando seeds AWS...');
    await db.seed.run({
      directory: './seeds',
      specific: '005_aws_settings.ts'
    });
    
    console.log('✅ Seeds AWS executados com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro ao executar migrations/seeds AWS:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

runAwsMigrations(); 
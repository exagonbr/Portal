'use strict';

const knex = require('knex');
const knexConfig = require('../../knexfile');

async function runMigrationsAndSeeds() {
  const environment = process.env.NODE_ENV || 'development';
  const db = knex(knexConfig[environment]);

  try {
    console.log('🚀 Iniciando execução de migrations e seeds...\n');

    // Executa as migrations
    console.log('📦 Executando migrations...');
    const [batchNo, migrations] = await db.migrate.latest();
    
    if (migrations.length === 0) {
      console.log('✅ Banco de dados já está atualizado!');
    } else {
      console.log(`✅ Batch ${batchNo} executado com sucesso!`);
      console.log('📋 Migrations executadas:');
      migrations.forEach(migration => {
        console.log(`   - ${migration}`);
      });
    }

    console.log('\n🌱 Executando seeds...');
    
    // Lista de seeds na ordem correta de execução
    const seedOrder = [
      '01_authors.js',
      '02_cookie_signed.js',
      '03_education_period.js',
      '04_educational_stage.js',
      '05_file.js',
      '06_forgot_password.js',
      '07_genre.js',
      '08_institution.js',
      '09_public.js',
      '10_role.js',
      '11_settings.js',
      '12_tag.js',
      '13_target_audience.js',
      '14_teacher_subject.js',
      '15_theme.js',
      '16_languages.js',
      '17_subjects.js',
      '18_education_cycles.js',
      '19_classes.js',
      '20_publishers.js',
      '21_schools.js',
      '22_education_periods.js',
      '23_permissions.js',
      '24_role_permissions.js',
      '20240115_settings_seed.js',
      '20250630210000-users-seed.js',
      '20250630214500_security_policies_seed.js',
      '20250630220100_units_seed.js'
    ];

    // Executa os seeds na ordem
    for (const seedFile of seedOrder) {
      try {
        const seedPath = `../database/seeds/${seedFile}`;
        const seed = require(seedPath);
        
        console.log(`   🌱 Executando ${seedFile}...`);
        await seed.seed(db);
        console.log(`   ✅ ${seedFile} executado com sucesso!`);
      } catch (error) {
        console.error(`   ❌ Erro ao executar ${seedFile}:`, error.message);
        // Continua com os próximos seeds mesmo se um falhar
      }
    }

    console.log('\n✨ Migrations e seeds executados com sucesso!');
    
    // Mostra estatísticas do banco
    console.log('\n📊 Estatísticas do banco de dados:');
    
    const tables = [
      'institution',
      'roles',
      'permissions',
      'user',
      'unit',
      'schools',
      'education_cycles',
      'classes',
      'subjects',
      'languages',
      'publishers'
    ];
    
    for (const table of tables) {
      try {
        const count = await db(table).count('* as total');
        console.log(`   - ${table}: ${count[0].total} registros`);
      } catch (error) {
        // Ignora se a tabela não existir
      }
    }

  } catch (error) {
    console.error('❌ Erro durante a execução:', error);
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Executa o script
runMigrationsAndSeeds()
  .then(() => {
    console.log('\n🎉 Processo concluído!');
    process.exit(0);
  })
  .catch(error => {
    console.error('❌ Erro fatal:', error);
    process.exit(1);
  });
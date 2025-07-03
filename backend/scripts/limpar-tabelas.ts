import knex from 'knex';
import config from '../knexfile';

async function limparTabelas() {
  const environment = process.env.NODE_ENV || 'development';
  const db = knex(config[environment]);

  try {
    console.log('🧹 Limpando tabelas para migração...');
    
    // Desabilitar verificação de foreign keys temporariamente
    await db.raw('SET session_replication_role = replica;');
    
    // Lista de tabelas para limpar (em ordem reversa de dependência)
    const tabelas = [
      'watchlist_entries',
      'viewing_statuses', 
      'user_question_answers',
      'question_answers',
      'questions',
      'certificates',
      'user_profiles',
      'school_classes',
      'school_units',
      'tv_show_target_audiences',
      'tv_show_authors',
      'institution_tv_shows',
      'video_education_periods',
      'video_educational_stages',
      'video_themes',
      'video_authors',
      'video_files',
      'tv_show_videos',
      'videos',
      'tv_shows',
      'files',
      'education_periods',
      'educational_stages',
      'target_audiences',
      'themes',
      'tags',
      'genres',
      'authors',
      'users',
      'institutions',
      'roles',
      'sabercon_migration_mapping'
    ];

    for (const tabela of tabelas) {
      try {
        const exists = await db.schema.hasTable(tabela);
        if (exists) {
          await db(tabela).del();
          console.log(`✅ Tabela ${tabela} limpa`);
        } else {
          console.log(`⚠️  Tabela ${tabela} não existe`);
        }
      } catch (error) {
        console.log(`⚠️  Erro ao limpar ${tabela}: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
    
    // Reabilitar verificação de foreign keys
    await db.raw('SET session_replication_role = DEFAULT;');
    
    console.log('🎉 Limpeza concluída com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro durante limpeza:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  } finally {
    await db.destroy();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  limparTabelas()
    .then(() => {
      console.log('🚀 Agora você pode executar a migração novamente!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export default limparTabelas; 
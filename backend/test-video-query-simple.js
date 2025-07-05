const knex = require('knex');

// Tentar diferentes configurações de banco
const configs = [
  // Configuração 1: Como está no env.production.portal
  {
    client: 'postgresql',
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'portal_sabercon',
      user: 'portal_user',
      password: 'root',
      ssl: false,
    }
  },
  // Configuração 2: Postgres padrão
  {
    client: 'postgresql',
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'portal_sabercon',
      user: 'postgres',
      password: 'root',
      ssl: false,
    }
  },
  // Configuração 3: Sem senha
  {
    client: 'postgresql',
    connection: {
      host: 'localhost',
      port: 5432,
      database: 'portal_sabercon',
      user: 'postgres',
      password: '',
      ssl: false,
    }
  }
];

async function testWithConfig(config, index) {
  console.log(`\n🔧 Testando configuração ${index + 1}: ${config.connection.user}@${config.connection.database}`);
  
  const db = knex(config);
  
  try {
    // Teste básico de conexão
    const result = await db.raw('SELECT 1 as test');
    console.log('✅ Conexão bem-sucedida!');
    
    // Verificar TV Shows
    const tvShows = await db('tv_show')
      .select('id', 'name')
      .whereNull('deleted')
      .limit(3);
    
    console.log(`📺 Encontrados ${tvShows.length} TV Shows:`);
    tvShows.forEach(show => {
      console.log(`  - ${show.name} (ID: ${show.id})`);
    });
    
    if (tvShows.length > 0) {
      const firstShow = tvShows[0];
      
      // Verificar vídeos
      const videos = await db('video')
        .select('id', 'title', 'name', 'season_number', 'episode_number')
        .where('show_id', firstShow.id)
        .whereNull('deleted')
        .limit(5);
      
      console.log(`🎬 Encontrados ${videos.length} vídeos para "${firstShow.name}":`);
      videos.forEach(video => {
        console.log(`  - ${video.title || video.name} (S${video.season_number}E${video.episode_number})`);
      });
      
      // Testar JOIN com video_file
      const videosWithFiles = await db('video as v')
        .leftJoin('video_file as vf', 'v.id', 'vf.video_files_id')
        .leftJoin('file as f', 'vf.file_id', 'f.id')
        .select(
          'v.id as video_id',
          'v.title',
          'v.season_number',
          'f.sha256hex',
          'f.extension'
        )
        .where('v.show_id', firstShow.id)
        .whereNull('v.deleted')
        .limit(3);
      
      console.log(`🔗 JOIN com arquivos retornou ${videosWithFiles.length} resultados:`);
      videosWithFiles.forEach(result => {
        console.log(`  - ${result.title} (S${result.season_number}) - Arquivo: ${result.sha256hex ? 'SIM' : 'NÃO'}`);
      });
    }
    
    await db.destroy();
    return true;
    
  } catch (error) {
    console.log(`❌ Erro: ${error.message}`);
    await db.destroy();
    return false;
  }
}

async function main() {
  console.log('🚀 Testando diferentes configurações de banco...');
  
  for (let i = 0; i < configs.length; i++) {
    const success = await testWithConfig(configs[i], i);
    if (success) {
      console.log(`\n✅ Configuração ${i + 1} funcionou! Parando aqui.`);
      break;
    }
  }
  
  console.log('\n🎉 Teste concluído!');
}

main().catch(console.error); 
const knex = require('knex');

// Configuração usando knex
const db = knex({
  client: 'pg',
  connection: {
    host: 'localhost',
    port: 5432,
    database: 'portal',
    user: 'postgres',
    password: 'postgres'
  }
});

async function checkVideoTables() {
  try {
    console.log('🔍 Verificando tabelas relacionadas a vídeo...\n');
    
    // 1. Listar todas as tabelas que contêm 'video' no nome
    const videoTables = await db.raw(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name LIKE '%video%'
      ORDER BY table_name
    `);
    
    console.log('📋 Tabelas com "video" no nome:');
    if (videoTables.rows.length === 0) {
      console.log('  Nenhuma tabela encontrada com "video" no nome');
    } else {
      videoTables.rows.forEach(table => {
        console.log(`  - ${table.table_name}`);
      });
    }
    
    // 2. Verificar tabela 'video' específica
    const hasVideo = await db.schema.hasTable('video');
    console.log(`\n🎬 Tabela 'video' existe: ${hasVideo ? 'SIM' : 'NÃO'}`);
    
    // 3. Verificar tabela 'videos' (plural)
    const hasVideos = await db.schema.hasTable('videos');
    console.log(`🎬 Tabela 'videos' existe: ${hasVideos ? 'SIM' : 'NÃO'}`);
    
    // 4. Se alguma tabela de vídeo existe, mostrar estrutura
    for (const tableName of ['video', 'videos']) {
      const exists = await db.schema.hasTable(tableName);
      if (exists) {
        console.log(`\n📝 Estrutura da tabela '${tableName}':`);
        const columns = await db.raw(`
          SELECT column_name, data_type, is_nullable
          FROM information_schema.columns 
          WHERE table_name = '${tableName}'
          ORDER BY ordinal_position
        `);
        
        columns.rows.forEach(col => {
          console.log(`  - ${col.column_name}: ${col.data_type} (${col.is_nullable === 'YES' ? 'nullable' : 'not null'})`);
        });
        
        // Contar registros
        const count = await db(tableName).count('* as total').first();
        console.log(`  📊 Total de registros: ${count.total}`);
        
        // Mostrar alguns exemplos se houver dados
        if (parseInt(count.total) > 0) {
          const samples = await db(tableName).limit(3);
          console.log(`  🎯 Primeiros 3 registros:`);
          samples.forEach((record, index) => {
            console.log(`    ${index + 1}. ID: ${record.id}, Nome/Título: ${record.name || record.title || 'N/A'}`);
          });
        }
      }
    }
    
    // 5. Procurar por colunas que referenciam tv_show
    console.log('\n🔗 Buscando tabelas que referenciam tv_show...');
    const tvShowRefs = await db.raw(`
      SELECT table_name, column_name
      FROM information_schema.columns 
      WHERE column_name LIKE '%tv_show%' 
      OR column_name LIKE '%show%'
      ORDER BY table_name, column_name
    `);
    
    if (tvShowRefs.rows.length > 0) {
      console.log('📋 Tabelas com referências a show/tv_show:');
      tvShowRefs.rows.forEach(ref => {
        console.log(`  - ${ref.table_name}.${ref.column_name}`);
      });
    }
    
  } catch (error) {
    console.error('❌ Erro:', error.message);
  } finally {
    await db.destroy();
  }
}

checkVideoTables(); 
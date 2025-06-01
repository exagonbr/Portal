import knex from 'knex';
import config from '../knexfile';

async function corrigirVideoFiles() {
  const environment = process.env.NODE_ENV || 'development';
  const db = knex(config[environment]);

  try {
    console.log('🔧 Corrigindo estrutura da tabela video_files...');
    
    // Verificar se a tabela existe
    const tableExists = await db.schema.hasTable('video_files');
    
    if (tableExists) {
      console.log('📝 Dropando tabela video_files antiga...');
      await db.schema.dropTable('video_files');
    }
    
    console.log('🆕 Criando tabela video_files com estrutura correta...');
    await db.schema.createTable('video_files', (table) => {
      table.uuid('id').primary().defaultTo(db.raw('gen_random_uuid()'));
      table.uuid('video_id').references('id').inTable('videos').onDelete('CASCADE');
      table.uuid('file_id').references('id').inTable('files').onDelete('CASCADE');
      table.enum('file_type', ['video', 'thumbnail', 'subtitle', 'transcript', 'attachment']).notNullable();
      table.string('quality'); // para vídeos: SD, HD, FHD, 4K
      table.string('language'); // para legendas/transcrições
      table.integer('order_index').defaultTo(0);
      table.timestamps(true, true);
      
      table.unique(['video_id', 'file_type', 'quality', 'language']);
      table.index(['video_id'], 'video_files_video_id_index');
      table.index(['file_id'], 'video_files_file_id_index');
      table.index(['file_type'], 'video_files_file_type_index');
    });
    
    console.log('✅ Tabela video_files corrigida com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    await db.destroy();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  corrigirVideoFiles()
    .then(() => {
      console.log('🎉 Correção concluída!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export default corrigirVideoFiles; 
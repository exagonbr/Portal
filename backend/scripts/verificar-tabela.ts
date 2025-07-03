import knex from 'knex';
import config from '../knexfile';

async function verificarTabela() {
  const environment = process.env.NODE_ENV || 'development';
  const db = knex(config[environment]);

  try {
    console.log('🔍 Verificando estrutura da tabela video_files...');
    
    // Verificar se a tabela existe
    const tableExists = await db.schema.hasTable('video_files');
    console.log(`Tabela video_files existe: ${tableExists}`);
    
    if (tableExists) {
      // Verificar colunas específicas
      const hasVideoId = await db.schema.hasColumn('video_files', 'video_id');
      const hasFileId = await db.schema.hasColumn('video_files', 'file_id');
      
      console.log(`Coluna video_id existe: ${hasVideoId}`);
      console.log(`Coluna file_id existe: ${hasFileId}`);
      
      // Obter todas as colunas da tabela
      const columns = await db.raw(`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'video_files' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `);
      
      console.log('\n📋 Estrutura da tabela video_files:');
      console.table(columns.rows);
    }
    
  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : String(error));
  } finally {
    await db.destroy();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  verificarTabela()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export default verificarTabela; 
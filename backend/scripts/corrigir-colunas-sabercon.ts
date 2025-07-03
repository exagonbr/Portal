import knex from 'knex';
import config from '../knexfile';

async function corrigirColunasSabercon() {
  const environment = process.env.NODE_ENV || 'development';
  const db = knex(config[environment]);

  try {
    console.log('🔧 Verificando e corrigindo colunas sabercon_id...');
    
    // Lista de tabelas que precisam da coluna sabercon_id
    const tabelasComSaberconId = [
      'viewing_statuses',
      'watchlist_entries'
    ];

    for (const tabela of tabelasComSaberconId) {
      const tableExists = await db.schema.hasTable(tabela);
      
      if (tableExists) {
        const hasSaberconId = await db.schema.hasColumn(tabela, 'sabercon_id');
        
        if (!hasSaberconId) {
          console.log(`➕ Adicionando coluna sabercon_id na tabela ${tabela}...`);
          await db.schema.alterTable(tabela, (table) => {
            table.bigInteger('sabercon_id').unique();
          });
          console.log(`✅ Coluna sabercon_id adicionada na tabela ${tabela}`);
        } else {
          console.log(`✓ Tabela ${tabela} já tem a coluna sabercon_id`);
        }
      } else {
        console.log(`⚠️  Tabela ${tabela} não existe`);
      }
    }
    
    console.log('🎉 Correção das colunas concluída!');
    
  } catch (error) {
    console.error('❌ Erro:', error instanceof Error ? error.message : String(error));
    throw error;
  } finally {
    await db.destroy();
  }
}

// Executar se chamado diretamente
if (require.main === module) {
  corrigirColunasSabercon()
    .then(() => {
      console.log('✅ Todas as colunas foram verificadas/corrigidas!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('❌ Erro fatal:', error);
      process.exit(1);
    });
}

export default corrigirColunasSabercon; 
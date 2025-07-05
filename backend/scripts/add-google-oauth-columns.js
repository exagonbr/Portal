const knex = require('knex');
const knexConfig = require('../knexfile');
require('dotenv').config();

// Função para verificar se uma tabela existe
async function tableExists(db, tableName) {
  return db.schema.hasTable(tableName);
}

// Função para verificar se uma coluna existe
async function columnExists(db, tableName, columnName) {
  return db.schema.hasColumn(tableName, columnName);
}

// Função para adicionar colunas OAuth do Google a uma tabela
async function addGoogleOAuthColumns(db, tableName) {
  try {
    console.log(`🔍 Verificando tabela ${tableName}...`);
    
    // Verificar se a tabela existe
    const exists = await tableExists(db, tableName);
    if (!exists) {
      console.log(`   ⚠️  Tabela ${tableName} não existe, pulando...`);
      return false;
    }
    
    // Lista de colunas OAuth do Google para adicionar
    const googleColumns = [
      { name: 'google_id', type: 'string', length: 255, unique: true },
      { name: 'google_email', type: 'string', length: 255 },
      { name: 'google_name', type: 'string', length: 255 },
      { name: 'google_picture', type: 'string', length: 500 },
      { name: 'google_access_token', type: 'text' },
      { name: 'google_refresh_token', type: 'text' },
      { name: 'google_token_expires_at', type: 'timestamp' },
      { name: 'is_google_verified', type: 'boolean', default: false },
      { name: 'google_linked_at', type: 'timestamp' }
    ];
    
    let columnsAdded = 0;
    let columnsSkipped = 0;
    
    // Verificar e adicionar cada coluna
    for (const column of googleColumns) {
      const exists = await columnExists(db, tableName, column.name);
      
      if (exists) {
        console.log(`   ℹ️  Coluna ${column.name} já existe`);
        columnsSkipped++;
        continue;
      }
      
      // Adicionar a coluna
      await db.schema.alterTable(tableName, (table) => {
        switch (column.type) {
          case 'string':
            if (column.unique) {
              table.string(column.name, column.length).unique().nullable();
            } else {
              table.string(column.name, column.length).nullable();
            }
            break;
          case 'text':
            table.text(column.name).nullable();
            break;
          case 'timestamp':
            table.timestamp(column.name).nullable();
            break;
          case 'boolean':
            table.boolean(column.name).defaultTo(column.default || false);
            break;
        }
      });
      
      console.log(`   ✅ Coluna ${column.name} adicionada`);
      columnsAdded++;
    }
    
    // Adicionar índices se colunas foram criadas
    if (columnsAdded > 0) {
      console.log(`   🔍 Adicionando índices...`);
      
      try {
        // Verificar se os índices já existem antes de criar
        const indexQueries = [
          `CREATE INDEX IF NOT EXISTS idx_${tableName}_google_id ON "${tableName}" (google_id);`,
          `CREATE INDEX IF NOT EXISTS idx_${tableName}_google_email ON "${tableName}" (google_email);`,
          `CREATE INDEX IF NOT EXISTS idx_${tableName}_is_google_verified ON "${tableName}" (is_google_verified);`
        ];
        
        for (const query of indexQueries) {
          await db.raw(query);
        }
        
        console.log(`   ✅ Índices adicionados`);
      } catch (indexError) {
        console.log(`   ⚠️  Alguns índices podem já existir: ${indexError.message}`);
      }
    }
    
    console.log(`   📊 Resumo: ${columnsAdded} colunas adicionadas, ${columnsSkipped} já existiam`);
    return columnsAdded > 0;
    
  } catch (error) {
    console.log(`   ❌ Erro ao processar tabela ${tableName}: ${error.message}`);
    return false;
  }
}

// Função principal
async function addGoogleOAuthToAllUserTables() {
  console.log('🚀 ADICIONANDO COLUNAS OAUTH GOOGLE ÀS TABELAS DE USUÁRIOS\n');
  
  let db = null;
  
  try {
    // Conectar ao banco
    console.log('🔌 Conectando ao banco de dados...');
    db = knex(knexConfig.development);
    console.log('✅ Conectado ao PostgreSQL!\n');
    
    // Lista de possíveis tabelas de usuários
    const userTableNames = ['User', 'user', 'users'];
    
    let tablesProcessed = 0;
    let tablesModified = 0;
    
    for (const tableName of userTableNames) {
      console.log(`\n📋 Processando tabela: ${tableName}`);
      
      const wasModified = await addGoogleOAuthColumns(db, tableName);
      tablesProcessed++;
      
      if (wasModified) {
        tablesModified++;
      }
    }
    
    console.log('\n🎉 PROCESSO CONCLUÍDO!\n');
    console.log('📊 Resumo:');
    console.log(`   • ${tablesProcessed} tabelas processadas`);
    console.log(`   • ${tablesModified} tabelas modificadas`);
    console.log(`   • Colunas OAuth Google adicionadas onde necessário`);
    console.log(`   • Índices criados para performance`);
    
    console.log('\n🔐 Colunas OAuth Google adicionadas:');
    console.log('   • google_id (VARCHAR 255, UNIQUE)');
    console.log('   • google_email (VARCHAR 255)');
    console.log('   • google_name (VARCHAR 255)');
    console.log('   • google_picture (VARCHAR 500)');
    console.log('   • google_access_token (TEXT)');
    console.log('   • google_refresh_token (TEXT)');
    console.log('   • google_token_expires_at (TIMESTAMP)');
    console.log('   • is_google_verified (BOOLEAN, default false)');
    console.log('   • google_linked_at (TIMESTAMP)');
    
    console.log('\n💡 Próximos passos:');
    console.log('   • Reinicie sua aplicação para reconhecer as novas colunas');
    console.log('   • Use o script link-google-oauth-example.ts para testar');
    console.log('   • Implemente autenticação OAuth no seu frontend');
    
  } catch (error) {
    console.log('\n❌ ERRO DURANTE O PROCESSO:');
    console.log(error.message);
    console.log('\nStack trace:');
    console.log(error.stack);
    throw error;
  } finally {
    // Fechar conexão
    if (db) {
      await db.destroy();
    }
  }
}

// Executar script se chamado diretamente
if (require.main === module) {
  addGoogleOAuthToAllUserTables()
    .then(() => {
      console.log('\n✅ Script finalizado com sucesso.');
      process.exit(0);
    })
    .catch(err => {
      console.log('\n❌ Erro fatal:', err.message);
      process.exit(1);
    });
}

module.exports = { addGoogleOAuthToAllUserTables, addGoogleOAuthColumns }; 
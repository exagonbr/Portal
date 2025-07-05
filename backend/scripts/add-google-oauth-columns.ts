import knex from 'knex';
import { Knex } from 'knex';
import knexConfig from '../knexfile.js';
import dotenv from 'dotenv';

// Carrega variáveis de ambiente
dotenv.config();

// Função para verificar se uma tabela existe
async function tableExists(db: Knex, tableName: string): Promise<boolean> {
  return db.schema.hasTable(tableName);
}

// Função para verificar se uma coluna existe
async function columnExists(db: Knex, tableName: string, columnName: string): Promise<boolean> {
  return db.schema.hasColumn(tableName, columnName);
}

// Função para adicionar colunas OAuth do Google a uma tabela
async function addGoogleOAuthColumns(db: Knex, tableName: string): Promise<boolean> {
  try {
    console.log(`🔍 Verificando tabela ${tableName}...`);
    
    // Verificar se a tabela existe
    const exists = await tableExists(db, tableName);
    if (!exists) {
      console.log(`   ⚠️  Tabela ${tableName} não existe, pulando...`);
      return false;
    }
    
    // Lista de colunas OAuth do Google e perfil para adicionar
    const googleColumns = [
      // Colunas OAuth Google
      { name: 'google_id', type: 'string', length: 255, unique: true },
      { name: 'google_email', type: 'string', length: 255 },
      { name: 'google_name', type: 'string', length: 255 },
      { name: 'google_picture', type: 'string', length: 500 },
      { name: 'google_access_token', type: 'text' },
      { name: 'google_refresh_token', type: 'text' },
      { name: 'google_token_expires_at', type: 'timestamp' },
      { name: 'is_google_verified', type: 'boolean', default: false },
      { name: 'google_linked_at', type: 'timestamp' },
      
      // Colunas de perfil comuns
      { name: 'profile_image', type: 'string', length: 500 },
      { name: 'avatar', type: 'string', length: 500 },
      { name: 'avatar_url', type: 'string', length: 500 },
      { name: 'profile_picture', type: 'string', length: 500 },
      { name: 'bio', type: 'text' },
      { name: 'description', type: 'text' },
      { name: 'first_name', type: 'string', length: 255 },
      { name: 'last_name', type: 'string', length: 255 },
      { name: 'display_name', type: 'string', length: 255 },
      { name: 'locale', type: 'string', length: 10 },
      { name: 'timezone', type: 'string', length: 50 },
      { name: 'birth_date', type: 'date' },
      { name: 'gender', type: 'string', length: 20 },
      { name: 'phone_verified', type: 'boolean', default: false },
      { name: 'email_verified', type: 'boolean', default: false },
      { name: 'two_factor_enabled', type: 'boolean', default: false },
      
      // Colunas de controle e versionamento
      { name: 'version', type: 'bigint', default: 0 },
      { name: 'revision', type: 'integer', default: 0 },
      { name: 'entity_version', type: 'integer', default: 1 },
      
      // Colunas de status e controle
      { name: 'status', type: 'string', length: 50, default: 'active' },
      { name: 'account_status', type: 'string', length: 50, default: 'active' },
      { name: 'verification_status', type: 'string', length: 50, default: 'pending' },
      { name: 'last_login_at', type: 'timestamp' },
      { name: 'last_activity_at', type: 'timestamp' },
      { name: 'login_count', type: 'integer', default: 0 },
      { name: 'failed_login_attempts', type: 'integer', default: 0 },
      { name: 'locked_until', type: 'timestamp' },
      
      // Colunas de configurações
      { name: 'preferences', type: 'json' },
      { name: 'settings', type: 'json' },
      { name: 'metadata', type: 'json' },
      
      // Colunas de relacionamento extras
      { name: 'manager_id', type: 'uuid' },
      { name: 'department_id', type: 'uuid' },
      { name: 'organization_id', type: 'uuid' },
      
      // Colunas de contato adicionais
      { name: 'mobile_phone', type: 'string', length: 50 },
      { name: 'work_phone', type: 'string', length: 50 },
      { name: 'alternative_email', type: 'string', length: 255 },
      
      // Colunas de endereço
      { name: 'street_address', type: 'string', length: 255 },
      { name: 'city', type: 'string', length: 100 },
      { name: 'state', type: 'string', length: 100 },
      { name: 'postal_code', type: 'string', length: 20 },
      { name: 'country', type: 'string', length: 100 },
      
      // Colunas de auditoria adicionais
      { name: 'created_by', type: 'uuid' },
      { name: 'updated_by', type: 'uuid' },
      { name: 'deleted_at', type: 'timestamp' },
      { name: 'deleted_by', type: 'uuid' }
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
              if (column.default) {
                table.string(column.name, column.length).unique().nullable().defaultTo(column.default);
              } else {
                table.string(column.name, column.length).unique().nullable();
              }
            } else {
              if (column.default) {
                table.string(column.name, column.length).nullable().defaultTo(column.default);
              } else {
                table.string(column.name, column.length).nullable();
              }
            }
            break;
          case 'text':
            table.text(column.name).nullable();
            break;
          case 'timestamp':
            table.timestamp(column.name).nullable();
            break;
          case 'date':
            table.date(column.name).nullable();
            break;
          case 'boolean':
            table.boolean(column.name).defaultTo(column.default || false);
            break;
          case 'integer':
            table.integer(column.name).defaultTo(column.default || 0);
            break;
          case 'bigint':
            table.bigInteger(column.name).defaultTo(column.default || 0);
            break;
          case 'json':
            table.json(column.name).nullable();
            break;
          case 'uuid':
            table.uuid(column.name).nullable();
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
      } catch (indexError: any) {
        console.log(`   ⚠️  Alguns índices podem já existir: ${indexError.message}`);
      }
    }
    
    console.log(`   📊 Resumo: ${columnsAdded} colunas adicionadas, ${columnsSkipped} já existiam`);
    return columnsAdded > 0;
    
  } catch (error: any) {
    console.log(`   ❌ Erro ao processar tabela ${tableName}: ${error.message}`);
    return false;
  }
}

// Função principal
async function addGoogleOAuthToAllUserTables(): Promise<void> {
  console.log('🚀 ADICIONANDO COLUNAS OAUTH GOOGLE E PERFIL ÀS TABELAS DE USUÁRIOS\n');
  
  let db: Knex | null = null;
  
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
    
  } catch (error: any) {
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

// Executar script
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

export { addGoogleOAuthToAllUserTables, addGoogleOAuthColumns }; 
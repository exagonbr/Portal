const mysql = require('mysql2/promise');
const knex = require('knex');

// Usar as mesmas configurações do projeto
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: parseInt(process.env.MYSQL_PORT || '3306'),
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'portal',
  connectTimeout: 30000,
  acquireTimeout: 30000,
  timeout: 30000
};

const pgConfig = {
  client: 'postgresql',
  connection: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'portal'
  }
};

async function testAnswerMigration() {
  let mysqlConnection;
  let pgConnection;

  try {
    console.log('🧪 Teste de Migração da Tabela Answer\n');

    // Conectar ao MySQL
    console.log('🔌 Conectando ao MySQL...');
    mysqlConnection = await mysql.createConnection(mysqlConfig);
    console.log('✅ MySQL conectado');

    // Conectar ao PostgreSQL
    console.log('🔌 Conectando ao PostgreSQL...');
    pgConnection = knex(pgConfig);
    await pgConnection.raw('SELECT 1'); // Teste de conexão
    console.log('✅ PostgreSQL conectado\n');

    // 1. Verificar tabelas no MySQL
    console.log('📋 Verificando tabelas no MySQL...');
    const [mysqlTables] = await mysqlConnection.execute(`
      SELECT TABLE_NAME, TABLE_ROWS 
      FROM INFORMATION_SCHEMA.TABLES 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME LIKE '%answer%'
    `, [mysqlConfig.database]);

    if (mysqlTables.length === 0) {
      console.log('❌ Nenhuma tabela com "answer" encontrada no MySQL');
      return;
    }

    console.log('📊 Tabelas encontradas no MySQL:');
    mysqlTables.forEach(table => {
      console.log(`  - ${table.TABLE_NAME}: ${table.TABLE_ROWS || 0} registros`);
    });

    // Usar a primeira tabela encontrada
    const mysqlTableName = mysqlTables[0].TABLE_NAME;
    const postgresTableName = mysqlTableName === 'answer' ? 'answers' : mysqlTableName;

    console.log(`\n🎯 Migrando: ${mysqlTableName} → ${postgresTableName}`);

    // 2. Obter estrutura da tabela MySQL
    console.log('\n📋 Analisando estrutura MySQL...');
    const [mysqlColumns] = await mysqlConnection.execute(`
      SELECT 
        COLUMN_NAME,
        DATA_TYPE,
        IS_NULLABLE,
        COLUMN_DEFAULT,
        CHARACTER_MAXIMUM_LENGTH,
        NUMERIC_PRECISION,
        NUMERIC_SCALE,
        COLUMN_TYPE,
        EXTRA,
        COLUMN_KEY
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `, [mysqlConfig.database, mysqlTableName]);

    console.log(`📊 Estrutura (${mysqlColumns.length} colunas):`);
    mysqlColumns.forEach(col => {
      console.log(`  - ${col.COLUMN_NAME}: ${col.COLUMN_TYPE} ${col.IS_NULLABLE === 'NO' ? 'NOT NULL' : 'NULL'} ${col.COLUMN_KEY === 'PRI' ? 'PRIMARY' : ''}`);
    });

    // 3. Verificar dados de exemplo
    console.log('\n🔍 Amostra de dados MySQL:');
    const [sampleData] = await mysqlConnection.execute(`SELECT * FROM \`${mysqlTableName}\` LIMIT 3`);
    
    if (sampleData.length > 0) {
      console.log(`📊 ${sampleData.length} registros de exemplo:`);
      sampleData.forEach((row, index) => {
        console.log(`\n  Registro ${index + 1}:`);
        Object.entries(row).forEach(([key, value]) => {
          const displayValue = value === null ? 'NULL' : 
                              typeof value === 'string' ? `"${value.substring(0, 50)}${value.length > 50 ? '...' : ''}"` :
                              value;
          console.log(`    ${key}: ${displayValue} (${typeof value})`);
        });
      });

      // Verificar problemas nos dados
      console.log('\n🔍 Verificando problemas nos dados...');
      let problemsFound = false;

      sampleData.forEach((row, index) => {
        Object.entries(row).forEach(([key, value]) => {
          if (typeof value === 'string') {
            if (value.includes('\0')) {
              console.log(`⚠️  Registro ${index + 1}, coluna "${key}": contém caracteres NULL (\\0)`);
              problemsFound = true;
            }
            if (value === '0000-00-00' || value === '0000-00-00 00:00:00') {
              console.log(`⚠️  Registro ${index + 1}, coluna "${key}": data MySQL inválida`);
              problemsFound = true;
            }
            if (value.length > 10000) {
              console.log(`⚠️  Registro ${index + 1}, coluna "${key}": texto muito longo (${value.length} chars)`);
              problemsFound = true;
            }
          }
        });
      });

      if (!problemsFound) {
        console.log('✅ Nenhum problema detectado nos dados de exemplo');
      }
    } else {
      console.log('📝 Tabela vazia');
    }

    // 4. Verificar se tabela existe no PostgreSQL
    console.log('\n🔍 Verificando PostgreSQL...');
    const pgTableExists = await pgConnection.schema.hasTable(postgresTableName);
    
    if (pgTableExists) {
      console.log(`✅ Tabela "${postgresTableName}" existe no PostgreSQL`);
      
      // Contar registros
      const pgCount = await pgConnection(postgresTableName).count('* as count').first();
      console.log(`📊 Registros no PostgreSQL: ${pgCount?.count || 0}`);
      
      // Verificar estrutura PostgreSQL
      const pgColumns = await pgConnection.raw(`
        SELECT column_name, data_type, is_nullable, column_default
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = ?
        ORDER BY ordinal_position
      `, [postgresTableName]);
      
      console.log(`📊 Estrutura PostgreSQL (${pgColumns.rows.length} colunas):`);
      pgColumns.rows.forEach(col => {
        console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? 'NOT NULL' : 'NULL'}`);
      });

      // Comparar estruturas
      console.log('\n🔍 Comparação de estruturas:');
      mysqlColumns.forEach(mysqlCol => {
        const pgCol = pgColumns.rows.find(pg => pg.column_name.toLowerCase() === mysqlCol.COLUMN_NAME.toLowerCase());
        if (!pgCol) {
          console.log(`❌ Coluna "${mysqlCol.COLUMN_NAME}" não existe no PostgreSQL`);
        } else {
          console.log(`✅ Coluna "${mysqlCol.COLUMN_NAME}" existe em ambos`);
        }
      });

    } else {
      console.log(`❌ Tabela "${postgresTableName}" NÃO existe no PostgreSQL`);
      console.log('💡 A tabela precisa ser criada durante a migração');
    }

    // 5. Contar total de registros
    const [totalCount] = await mysqlConnection.execute(`SELECT COUNT(*) as count FROM \`${mysqlTableName}\``);
    console.log(`\n📊 Total de registros no MySQL: ${totalCount[0].count}`);

    // 6. Sugestões de melhoria
    console.log('\n💡 Sugestões para melhorar a migração:');
    
    // Verificar tipos problemáticos
    const problematicTypes = mysqlColumns.filter(col => 
      col.DATA_TYPE.toLowerCase() === 'enum' ||
      col.DATA_TYPE.toLowerCase() === 'set' ||
      col.COLUMN_TYPE.includes('tinyint(1)') ||
      col.DATA_TYPE.toLowerCase() === 'json'
    );

    if (problematicTypes.length > 0) {
      console.log('⚠️  Tipos que precisam de atenção especial:');
      problematicTypes.forEach(col => {
        if (col.COLUMN_TYPE.includes('tinyint(1)')) {
          console.log(`  - ${col.COLUMN_NAME}: tinyint(1) → boolean`);
        } else if (col.DATA_TYPE.toLowerCase() === 'enum') {
          console.log(`  - ${col.COLUMN_NAME}: enum → text + constraint`);
        } else if (col.DATA_TYPE.toLowerCase() === 'set') {
          console.log(`  - ${col.COLUMN_NAME}: set → text + constraint`);
        } else if (col.DATA_TYPE.toLowerCase() === 'json') {
          console.log(`  - ${col.COLUMN_NAME}: json → jsonb (recomendado)`);
        }
      });
    }

    // Verificar colunas sem chave primária
    const hasPrimaryKey = mysqlColumns.some(col => col.COLUMN_KEY === 'PRI');
    if (!hasPrimaryKey) {
      console.log('⚠️  Tabela sem chave primária - será adicionada coluna "id" auto-increment');
    }

    console.log('\n✅ Análise concluída!');

  } catch (error) {
    console.error('❌ Erro durante o teste:', error.message);
    if (error.code) {
      console.error('   Código do erro:', error.code);
    }
    if (error.sqlMessage) {
      console.error('   Mensagem SQL:', error.sqlMessage);
    }
  } finally {
    if (mysqlConnection) {
      await mysqlConnection.end();
      console.log('🔌 Conexão MySQL fechada');
    }
    if (pgConnection) {
      await pgConnection.destroy();
      console.log('🔌 Conexão PostgreSQL fechada');
    }
  }
}

// Executar teste
if (require.main === module) {
  testAnswerMigration().catch(console.error);
}

module.exports = { testAnswerMigration }; 
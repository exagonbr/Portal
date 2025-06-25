const mysql = require('mysql2/promise');
const { Client } = require('pg');

// Configurações de conexão
const mysqlConfig = {
  host: process.env.MYSQL_HOST || 'localhost',
  port: process.env.MYSQL_PORT || 3306,
  user: process.env.MYSQL_USER || 'root',
  password: process.env.MYSQL_PASSWORD || '',
  database: process.env.MYSQL_DATABASE || 'portal'
};

const pgConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 5432,
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'portal'
};

async function analyzeAnswerTable() {
  let mysqlConnection;
  let pgClient;

  try {
    console.log('🔍 Analisando tabela "answer"...\n');

    // Conectar ao MySQL
    mysqlConnection = await mysql.createConnection(mysqlConfig);
    console.log('✅ Conectado ao MySQL');

    // Conectar ao PostgreSQL
    pgClient = new Client(pgConfig);
    await pgClient.connect();
    console.log('✅ Conectado ao PostgreSQL\n');

    // 1. Verificar se a tabela existe no MySQL
    const [mysqlTables] = await mysqlConnection.execute(
      "SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ? AND TABLE_NAME IN ('answer', 'answers')",
      [mysqlConfig.database]
    );

    if (mysqlTables.length === 0) {
      console.log('❌ Tabela "answer" ou "answers" não encontrada no MySQL');
      return;
    }

    const mysqlTableName = mysqlTables[0].TABLE_NAME;
    console.log(`📋 Tabela MySQL encontrada: "${mysqlTableName}"`);

    // 2. Obter estrutura da tabela MySQL
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
        EXTRA
      FROM INFORMATION_SCHEMA.COLUMNS 
      WHERE TABLE_SCHEMA = ? AND TABLE_NAME = ?
      ORDER BY ORDINAL_POSITION
    `, [mysqlConfig.database, mysqlTableName]);

    console.log('\n📊 Estrutura MySQL:');
    console.log('┌─────────────────────┬─────────────────────┬─────────────┬─────────────────┐');
    console.log('│ Coluna              │ Tipo MySQL          │ Nullable    │ Extra           │');
    console.log('├─────────────────────┼─────────────────────┼─────────────┼─────────────────┤');
    
    mysqlColumns.forEach(col => {
      console.log(`│ ${col.COLUMN_NAME.padEnd(19)} │ ${col.COLUMN_TYPE.padEnd(19)} │ ${col.IS_NULLABLE.padEnd(11)} │ ${(col.EXTRA || '').padEnd(15)} │`);
    });
    console.log('└─────────────────────┴─────────────────────┴─────────────┴─────────────────┘');

    // 3. Verificar se tabela existe no PostgreSQL
    const pgTableCheck = await pgClient.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public' AND table_name IN ('answer', 'answers')
    `);

    if (pgTableCheck.rows.length === 0) {
      console.log('\n❌ Tabela "answer" ou "answers" não encontrada no PostgreSQL');
      console.log('💡 Sugestão: A tabela precisa ser criada durante a migração');
    } else {
      const pgTableName = pgTableCheck.rows[0].table_name;
      console.log(`\n📋 Tabela PostgreSQL encontrada: "${pgTableName}"`);

      // Obter estrutura PostgreSQL
      const pgColumns = await pgClient.query(`
        SELECT 
          column_name,
          data_type,
          is_nullable,
          column_default,
          character_maximum_length,
          numeric_precision,
          numeric_scale
        FROM information_schema.columns 
        WHERE table_schema = 'public' AND table_name = $1
        ORDER BY ordinal_position
      `, [pgTableName]);

      console.log('\n📊 Estrutura PostgreSQL:');
      console.log('┌─────────────────────┬─────────────────────┬─────────────┬─────────────────┐');
      console.log('│ Coluna              │ Tipo PostgreSQL     │ Nullable    │ Default         │');
      console.log('├─────────────────────┼─────────────────────┼─────────────┼─────────────────┤');
      
      pgColumns.rows.forEach(col => {
        console.log(`│ ${col.column_name.padEnd(19)} │ ${col.data_type.padEnd(19)} │ ${col.is_nullable.padEnd(11)} │ ${(col.column_default || '').substring(0,15).padEnd(15)} │`);
      });
      console.log('└─────────────────────┴─────────────────────┴─────────────┴─────────────────┘');

      // 4. Comparar estruturas e identificar incompatibilidades
      console.log('\n🔍 Análise de Compatibilidade:');
      
      mysqlColumns.forEach(mysqlCol => {
        const pgCol = pgColumns.rows.find(pg => pg.column_name === mysqlCol.COLUMN_NAME);
        
        if (!pgCol) {
          console.log(`❌ Coluna "${mysqlCol.COLUMN_NAME}" existe no MySQL mas não no PostgreSQL`);
          return;
        }

        const mysqlType = mysqlCol.DATA_TYPE.toLowerCase();
        const pgType = pgCol.data_type.toLowerCase();
        
        // Verificar compatibilidade de tipos
        const typeCompatible = checkTypeCompatibility(mysqlType, pgType, mysqlCol, pgCol);
        
        if (!typeCompatible.compatible) {
          console.log(`⚠️  Incompatibilidade na coluna "${mysqlCol.COLUMN_NAME}": ${typeCompatible.issue}`);
          console.log(`   MySQL: ${mysqlCol.COLUMN_TYPE} | PostgreSQL: ${pgCol.data_type}`);
          console.log(`   💡 Sugestão: ${typeCompatible.suggestion}`);
        } else {
          console.log(`✅ Coluna "${mysqlCol.COLUMN_NAME}" compatível`);
        }
      });
    }

    // 5. Contar registros
    const [mysqlCount] = await mysqlConnection.execute(`SELECT COUNT(*) as count FROM ${mysqlTableName}`);
    console.log(`\n📊 Registros no MySQL: ${mysqlCount[0].count}`);

    if (pgTableCheck.rows.length > 0) {
      const pgCount = await pgClient.query(`SELECT COUNT(*) as count FROM ${pgTableCheck.rows[0].table_name}`);
      console.log(`📊 Registros no PostgreSQL: ${pgCount.rows[0].count}`);
      
      if (mysqlCount[0].count !== parseInt(pgCount.rows[0].count)) {
        console.log('⚠️  Diferença na contagem de registros detectada!');
      }
    }

    // 6. Verificar dados de exemplo
    console.log('\n🔍 Amostra de dados MySQL (primeiros 3 registros):');
    const [sampleData] = await mysqlConnection.execute(`SELECT * FROM ${mysqlTableName} LIMIT 3`);
    
    if (sampleData.length > 0) {
      console.table(sampleData);
      
      // Verificar se há caracteres especiais ou dados problemáticos
      sampleData.forEach((row, index) => {
        Object.entries(row).forEach(([key, value]) => {
          if (typeof value === 'string') {
            if (value.includes('\n') || value.includes('\r')) {
              console.log(`⚠️  Registro ${index + 1}, coluna "${key}": contém quebras de linha`);
            }
            if (value.includes('\0')) {
              console.log(`❌ Registro ${index + 1}, coluna "${key}": contém caracteres NULL (\\0)`);
            }
            if (value.length > 1000) {
              console.log(`⚠️  Registro ${index + 1}, coluna "${key}": texto muito longo (${value.length} chars)`);
            }
          }
        });
      });
    } else {
      console.log('📝 Tabela vazia');
    }

  } catch (error) {
    console.error('❌ Erro durante análise:', error.message);
  } finally {
    if (mysqlConnection) await mysqlConnection.end();
    if (pgClient) await pgClient.end();
  }
}

function checkTypeCompatibility(mysqlType, pgType, mysqlCol, pgCol) {
  // Mapeamentos de tipos conhecidos
  const typeMap = {
    'int': ['integer', 'bigint'],
    'bigint': ['bigint', 'integer'],
    'varchar': ['character varying', 'text'],
    'text': ['text', 'character varying'],
    'longtext': ['text'],
    'mediumtext': ['text'],
    'tinytext': ['text', 'character varying'],
    'char': ['character', 'character varying'],
    'datetime': ['timestamp without time zone', 'timestamp with time zone'],
    'timestamp': ['timestamp without time zone', 'timestamp with time zone'],
    'date': ['date'],
    'time': ['time without time zone', 'time with time zone'],
    'decimal': ['numeric', 'decimal'],
    'float': ['real', 'double precision'],
    'double': ['double precision', 'real'],
    'tinyint': ['smallint', 'integer', 'boolean'],
    'smallint': ['smallint', 'integer'],
    'mediumint': ['integer'],
    'json': ['json', 'jsonb', 'text'],
    'blob': ['bytea'],
    'longblob': ['bytea'],
    'mediumblob': ['bytea'],
    'tinyblob': ['bytea']
  };

  const compatibleTypes = typeMap[mysqlType] || [];
  
  if (compatibleTypes.includes(pgType)) {
    return { compatible: true };
  }

  // Verificações específicas
  if (mysqlType === 'tinyint' && mysqlCol.COLUMN_TYPE === 'tinyint(1)') {
    if (pgType !== 'boolean') {
      return {
        compatible: false,
        issue: 'tinyint(1) deveria ser boolean',
        suggestion: 'Alterar para tipo boolean no PostgreSQL'
      };
    }
  }

  if (mysqlType === 'varchar' && pgType === 'character varying') {
    const mysqlLength = mysqlCol.CHARACTER_MAXIMUM_LENGTH;
    const pgLength = pgCol.character_maximum_length;
    
    if (mysqlLength && pgLength && mysqlLength > pgLength) {
      return {
        compatible: false,
        issue: `Tamanho varchar incompatível (MySQL: ${mysqlLength}, PG: ${pgLength})`,
        suggestion: `Aumentar tamanho para ${mysqlLength} no PostgreSQL`
      };
    }
  }

  return {
    compatible: false,
    issue: `Tipos incompatíveis: ${mysqlType} → ${pgType}`,
    suggestion: `Mapear ${mysqlType} para um dos tipos: ${compatibleTypes.join(', ') || 'tipo compatível'}`
  };
}

// Executar análise
if (require.main === module) {
  analyzeAnswerTable().catch(console.error);
}

module.exports = { analyzeAnswerTable }; 